import firebase_admin
from firebase_admin import credentials, storage
import pandas as pd
import numpy as np

from flask import Flask, request, jsonify
from flask_cors import CORS

import json
import logging
import os  # 환경 변수 사용을 위해 추가

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# Firebase Admin SDK 초기화
firebase_config = {
    "type": "service_account",
    "project_id": os.getenv('FIREBASE_PROJECT_ID'),
    "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
}

cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred, {
    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')  # Firebase 스토리지 버킷도 환경 변수로 처리
})

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# 전역 변수
valData = None
tsdf = None

# Firebase에서 데이터 불러오기
def fetch_data_from_firebase():
    global valData, tsdf
    bucket = storage.bucket()

    # valData 파일 다운로드 및 로드
    val_data_blob = bucket.blob('valData.csv')
    val_data_file = '/tmp/valData.csv'
    val_data_blob.download_to_filename(val_data_file)
    valData = pd.read_csv(val_data_file).drop(columns=['Unnamed: 0'])

    # tsdf 파일 다운로드 및 로드
    tsdf_blob = bucket.blob('tsdf.csv')
    tsdf_file = '/tmp/tsdf.csv'
    tsdf_blob.download_to_filename(tsdf_file)
    tsdf = pd.read_csv(tsdf_file).drop(columns=['Unnamed: 0'])

    # 다운로드한 파일 삭제
    os.remove(val_data_file)
    os.remove(tsdf_file)

# Flask 앱이 시작될 때 Firebase 데이터 한 번 불러오기
@app.before_first_request
def load_data():
    fetch_data_from_firebase()

def pre_process(df, ranges):
    df['commission_mean'] = np.mean(df['commission'])
    
    def within_range(value, min_val, max_val, num):
        return 1 if min_val <= value <= max_val else num

    for column, (min_val, max_val) in ranges.items():
            if column in df.columns:
                if column == 'commission' or column == 'jailed_ratio':
                    df[column] = df[column].apply(lambda x: x * within_range(x, min_val, max_val, 1))
                elif column == 'missblock':
                    df[column] = df[column].apply(lambda x: x * within_range(x, min_val, max_val, max_val))
                else:
                    df[column] = df[column].apply(lambda x: x * within_range(x, min_val, max_val, 0))

    df['commission_rank'] = df['commission'].rank(ascending=False)
    scaler_0_1 = MinMaxScaler(feature_range=(0, 1))
    
    # df['missblock_rank'] = df['missblock'].rank(ascending=False)
    df['missblock_scaled'] = scaler_0_1.fit_transform(df['missblock'].values.reshape(-1, 1)).flatten()
    df['commission_variance_log'] = np.log1p(df['commission_variance'])
    df['commission_variance_scaled'] = scaler_0_1.fit_transform(df['commission_variance_log'].values.reshape(-1, 1)).flatten()
    df['asset_value_log'] = np.log1p(df['asset_value'])
    # df['asset_value_rank'] = df['asset_value'].rank(ascending=False)
    df['asset_value_scaled'] = scaler_0_1.fit_transform(df['asset_value_log'].values.reshape(-1, 1)).flatten()
    df['asset_variance_log'] = np.log1p(np.sqrt(df['asset_variance']))
    df['asset_variance_scaled'] = scaler_0_1.fit_transform(df['asset_variance_log'].values.reshape(-1, 1)).flatten()

    df['delegator_log'] = np.log1p(df['delegator'])
    max_rank = df['rank'].max()+1
    df['rank'] = df['rank'].apply(lambda x: max_rank if x == 0 else x)

    return df


def weightScore(chainScore, weight):
    chainScore['contribution_score'] = chainScore['contribution_score'] * weight[0] / sum(weight)
    chainScore['stability_score'] = chainScore['stability_score'] * weight[1] / sum(weight)
    chainScore['popularity_score'] = chainScore['popularity_score'] * weight[2] / sum(weight)
    chainScore['commission_score'] = chainScore['commission_score'] * weight[3] / sum(weight)
    chainScore['period_score'] = chainScore['period_score'] * weight[4] / sum(weight)
    chainScore['total_score'] = chainScore['contribution_score'] + chainScore['stability_score'] + chainScore['popularity_score'] + chainScore['commission_score'] + chainScore['period_score']

    return chainScore


def cal_score(df, weight):
    scaler_0_100 = MinMaxScaler(feature_range=(0, 100))
    score = df[['chain', 'voter']]

    # Contribution
    score['contribution_score'] = df['p_participation'] + df['p_passed'] + df['p_matchproposal']
    score['contribution_score'] = scaler_0_100.fit_transform(score[['contribution_score']])

    # Stability
    score['stability_score'] = df['asset_value_scaled'] * (1 - df['asset_variance_scaled']) - df['missblock_scaled'] - df['jailed_ratio'] - df['commission_variance_scaled']
    score['stability_score'] = scaler_0_100.fit_transform(score[['stability_score']])

    # Popularity
    score['popularity_score'] = df['delegator_log'] + 1 / (df['rank'])
    score['popularity_score'] = scaler_0_100.fit_transform(score[['popularity_score']])

    # Commission
    score['commission_score'] = 1 - (df['commission'] / df['commission_mean']) + (df['commission_rank'] / len(df) * 100)
    score['commission_score'] = scaler_0_100.fit_transform(score[['commission_score']])

    # Period
    score['period_score'] = df['day']
    score['period_score'] = scaler_0_100.fit_transform(score[['period_score']])

    return weightScore(score, weight)

def cal_final_score(in_score, out_score, ratio):
    out_score = out_score.drop_duplicates(subset=['voter'])
    in_score = in_score.drop_duplicates(subset=['voter'])
    score = in_score[['chain', 'voter', 'in_score']]
    score = score.merge(out_score[['voter', 'out_score']], how='left', on='voter')
    score['final_score'] = score['in_score'] * ratio[0] + score['out_score'] * ratio[1]
    
    return score

def calculate_angles(features):
    num_features = len(features)
    angles = {}
    for i, feature in enumerate(features):
        angles[feature] = (2 * np.pi * i) / num_features
    return angles

def calculate_position(row, angles):
    x = 0
    y = 0
    total_score = sum(row)

    for feature, score in row.items():
        angle = angles[feature]
        x += np.cos(angle) * score
        y += np.sin(angle) * score

    x /= total_score
    y /= total_score

    return x, y

def calculate_point_angle(x, y):
    return np.arctan2(y, x)

features = ["contribution_score", "stability_score", "popularity_score", "commission_score", "period_score"]
angles = calculate_angles(features)
def calculate_degrees(row):
    scores = row[features]
    x, y = calculate_position(scores, angles)
    point_angle = calculate_point_angle(x, y)
    point_angle_degrees = np.degrees(point_angle)
    if point_angle_degrees < 0:
        point_angle_degrees += 360
    return point_angle_degrees


@app.route('/')
def home():
    return jsonify(message="Proof of Validator")


@app.route('/getHist', methods=['POST'])
def getHist():
    try:
        data = request.get_json()

        chain = data['chain']
        chainData = valData[valData['chain']==chain]
        
        participation = sorted([d for d in chainData['p_participation']])
        passed = sorted([d for d in chainData['p_passed']])
        match = sorted([d for d in chainData['p_matchproposal']])
        missblock = sorted([d for d in chainData['missblock']])
        jailed_ratio = sorted([d for d in chainData['jailed_ratio']])
        asset_value = sorted([d for d in chainData['asset_value']])
        delegator = sorted([d for d in chainData['delegator']])
        rank = sorted([d for d in chainData['rank']])
        commission = sorted([d for d in chainData['commission']])
        day = sorted([d for d in chainData['day']])

        combined_json = {
            "participation": participation,
            "passed": passed,
            "match": match,
            "missblock": missblock,
            "jailed_ratio": jailed_ratio,
            "asset_value": asset_value,
            "delegator": delegator,
            "rank": rank,
            "commission": commission,
            "day": day
        }

        return jsonify(combined_json), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

    
@app.route('/getSimilarity', methods=['POST'])
def getSimilarity():
    try:
        data = request.get_json()
        chain = data['chain']
        voter = data['voter']
        weight = data['weight']
        inout_ratio = data['inout_ratio']

        participation = data['p_participation']
        passed = data['p_passed']
        match = data['p_match']
        missblock = data['missblock']
        jailed_ratio = data['jailed_ratio']
        asset_value = data['asset_value']
        delegator = data['delegator']
        rank = data['rank']
        commission = data['commission']
        day = data['day']
        selected = data['selected']

        ranges = {
            "p_participation": participation,
            "p_passed": passed,
            "p_matchproposal": match,
            "missblock": missblock,
            "jailed_ratio": jailed_ratio,
            "asset_value": asset_value,
            "delegator": delegator,
            "rank": rank,
            "commission": commission,
            "day": day
        }

        chain_data = valData[valData['chain'] == chain]
        voters = pd.DataFrame([v for v in chain_data['voter']]).rename(columns={0: 'voter'})
        val_data = valData[valData['voter'].isin(voters['voter'])]

        # 데이터 전처리
        in_data = pre_process(chain_data, ranges)
        out_data = pre_process(val_data, ranges)

        # 점수 계산
        in_score = cal_score(in_data, weight).rename(columns={'total_score': 'in_score'})
        out_score = cal_score(out_data, weight).merge(out_data[['chain', 'voter', 'proportion_av']], how='left', on=['chain', 'voter'])
        out_score['out_score'] = out_score['total_score']*out_score['proportion_av']
        out_score = out_score[['voter', 'out_score']].groupby('voter').sum().reset_index(drop=False)
        fin_score = cal_final_score(in_score, out_score, inout_ratio).sort_values(by='final_score', ascending=False).reset_index(drop=True)

        # 유사도 계산
        similar_data = in_score.drop(columns=['in_score']).merge(fin_score[['chain', 'voter', 'final_score']], how='left', on=['chain', 'voter']).sort_values(by='final_score', ascending=False).reset_index(drop=True)
        mrg_data = val_data[['chain', 'voter', 'p_participation', 'p_passed', 'p_matchproposal', 'missblock', 'jailed_ratio', 'asset_value', 'commission', 'rank', 'delegator', 'day']]
        similar_data = similar_data.merge(mrg_data, how='left', on=['chain', 'voter'])
        
        similar_feature = similar_data.copy()
        similar_feature = similar_feature.drop(columns=['chain', 'voter'])

        scaler = StandardScaler()
        similar_feature_scaled = scaler.fit_transform(similar_feature)
        similarity_matrix = cosine_similarity(similar_feature_scaled)
        similarity_df = pd.DataFrame(similarity_matrix, index=similar_data['voter'], columns=similar_data['voter'])

        if selected:
            sorted_similarities = similarity_df[voter].sort_values(ascending=False)
        else:
            sorted_similarities = similarity_df[fin_score['voter'].iloc[0]].sort_values(ascending=False)
        sorted_voters = sorted_similarities.sort_values(ascending=False).index
        sorted_similarity_df = similarity_df.loc[sorted_voters, sorted_voters]

        # 반환값 추출
        if selected:
            result_data = pd.DataFrame(sorted_similarity_df.iloc[0]).reset_index(drop=False).rename(columns={voter: 'similarity'})
        else:
            result_data = pd.DataFrame(sorted_similarity_df.iloc[0]).reset_index(drop=False).rename(columns={fin_score['voter'].iloc[0]: 'similarity'})
        result_data = result_data.merge(in_score, how='left', on=['voter']).drop(columns=['chain', 'in_score']).merge(fin_score, how='left', on=['voter']).drop(columns=['chain', 'in_score', 'out_score'])
        result_data['degree'] = result_data.apply(calculate_degrees, axis=1)
        result_data = result_data.to_json(orient='records')

        return result_data, 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/getSimilarInfo', methods=['POST'])
def getSimilarInfo():
    try:
        data = request.get_json()
        chain = data['chain']
        voter = data['voter']
        weight = data['weight']
        inout_ratio = data['inout_ratio']

        participation = data['p_participation']
        passed = data['p_passed']
        match = data['p_match']
        missblock = data['missblock']
        jailed_ratio = data['jailed_ratio']
        asset_value = data['asset_value']
        delegator = data['delegator']
        rank = data['rank']
        commission = data['commission']
        day = data['day']
        selected = data['selected']

        ranges = {
            "p_participation": participation,
            "p_passed": passed,
            "p_matchproposal": match,
            "missblock": missblock,
            "jailed_ratio": jailed_ratio,
            "asset_value": asset_value,
            "delegator": delegator,
            "rank": rank,
            "commission": commission,
            "day": day
        }

        chain_data = valData[valData['chain'] == chain]
        voters = pd.DataFrame([v for v in chain_data['voter']]).rename(columns={0: 'voter'})
        val_data = valData[valData['voter'].isin(voters['voter'])]

        # 데이터 전처리
        in_data = pre_process(chain_data, ranges)
        out_data = pre_process(val_data, ranges)

        # 점수 계산
        in_score = cal_score(in_data, weight).rename(columns={'total_score': 'in_score'})
        out_score = cal_score(out_data, weight).merge(out_data[['chain', 'voter', 'proportion_av']], how='left', on=['chain', 'voter'])
        out_score['out_score'] = out_score['total_score']*out_score['proportion_av']
        out_score = out_score[['voter', 'out_score']].groupby('voter').sum().reset_index(drop=False)
        fin_score = cal_final_score(in_score, out_score, inout_ratio).sort_values(by='final_score', ascending=False).reset_index(drop=True)

        # 새로운 랭크 계산
        rank_data = valData[valData['chain']==chain].merge(fin_score, how='left', on=['chain', 'voter'])
        rank_data = rank_data[['voter', 'final_score']]
        rank_data = rank_data.sort_values(by='final_score', ascending=False).reset_index(drop=True).reset_index(drop=False)
        rank_data['index'] = rank_data['index']+1

        # 유사도 계산
        similar_data = in_score.drop(columns=['in_score']).merge(fin_score[['chain', 'voter', 'final_score']], how='left', on=['chain', 'voter']).sort_values(by='final_score', ascending=False).reset_index(drop=True)
        mrg_data = val_data[['chain', 'voter', 'p_participation', 'p_passed', 'p_matchproposal', 'missblock', 'jailed_ratio', 'asset_value', 'commission', 'rank', 'delegator', 'day']]
        similar_data = similar_data.merge(mrg_data, how='left', on=['chain', 'voter'])

        similar_feature = similar_data.copy()
        similar_feature = similar_feature.drop(columns=['chain', 'voter'])

        scaler = StandardScaler()
        similar_feature_scaled = scaler.fit_transform(similar_feature)
        similarity_matrix = cosine_similarity(similar_feature_scaled)
        similarity_df = pd.DataFrame(similarity_matrix, index=similar_data['voter'], columns=similar_data['voter'])
        
        # 유사한 검증인 추출
        if selected:
            sorted_similarities = similarity_df[voter].sort_values(ascending=False)
        else:
            sorted_similarities = similarity_df[fin_score['voter'].iloc[0]].sort_values(ascending=False)
        top_6_voters = sorted_similarities.head(6)
        filtered_top_voters = top_6_voters[top_6_voters >= 0.8]
        filtered_similarity_df = similarity_df.loc[filtered_top_voters.index, filtered_top_voters.index].reset_index(drop=False)

        if selected:
            similarity_data = pd.DataFrame(filtered_similarity_df).reset_index(drop=False).rename(columns={voter: 'similarity'}).reset_index(drop=True)
        else:
            similarity_data = pd.DataFrame(filtered_similarity_df).reset_index(drop=False).rename(columns={fin_score['voter'].iloc[0]: 'similarity'}).reset_index(drop=True)
        all_score = in_score.merge(fin_score, how='left', on=['chain', 'voter', 'in_score']).sort_values(by='final_score', ascending=False).reset_index(drop=True)
        similar_vals = filtered_similarity_df[['voter']].merge(all_score, how='left', on='voter').reset_index(drop=True)
        similar_vals = similar_vals.merge(rank_data, how='left', on=['voter', 'final_score']).merge(similarity_data[['voter', 'similarity']], how='left', on=['voter'])
        similar_vals = similar_vals.to_json(orient='records')

        return similar_vals, 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/getRaw', methods=['POST'])
def getRaw():
    try:
        data = request.get_json()
        chain = data['chain']
        weight = data['weight']
        inout_ratio = data['inout_ratio']

        participation = data['p_participation']
        passed = data['p_passed']
        match = data['p_match']
        missblock = data['missblock']
        jailed_ratio = data['jailed_ratio']
        asset_value = data['asset_value']
        delegator = data['delegator']
        rank = data['rank']
        commission = data['commission']
        day = data['day']

        ranges = {
            "p_participation": participation,
            "p_passed": passed,
            "p_matchproposal": match,
            "missblock": missblock,
            "jailed_ratio": jailed_ratio,
            "asset_value": asset_value,
            "delegator": delegator,
            "rank": rank,
            "commission": commission,
            "day": day
        }

        chain_data = valData[valData['chain'] == chain]
        voters = pd.DataFrame([v for v in chain_data['voter']]).rename(columns={0: 'voter'})
        val_data = valData[valData['voter'].isin(voters['voter'])]

        # 데이터 전처리
        in_data = pre_process(chain_data, ranges)
        out_data = pre_process(val_data, ranges)

        # 점수 계산
        in_score = cal_score(in_data, weight).rename(columns={'total_score': 'in_score'})
        out_score = cal_score(out_data, weight).merge(out_data[['chain', 'voter', 'proportion_av']], how='left', on=['chain', 'voter'])
        out_score['out_score'] = out_score['total_score']*out_score['proportion_av']
        out_score = out_score[['voter', 'out_score']].groupby('voter').sum().reset_index(drop=False)
        fin_score = cal_final_score(in_score, out_score, inout_ratio).sort_values(by='final_score', ascending=False).reset_index(drop=True)

        # 반환값 정리
        result_data = valData[valData['chain']==chain].merge(fin_score, how='left', on=['chain', 'voter'])
        result_data = result_data[['voter', 'final_score', 'token', 'rank', 'delegator', 'voting_power', 'p_participation', 'p_passed', 'p_matchproposal', 'missblock', 'jailed_ratio', 'commission', 'asset_value', 'day']]
        result_data = result_data.sort_values(by='final_score', ascending=False).reset_index(drop=True)
        result_data = result_data.to_json(orient='records')

        return result_data, 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    

@app.route('/timeSeriesData', methods=['POST'])
def timeSeriesData():
    try:
        data = request.get_json()

        chain, similars, check = data["chain"], data["similars"], data["check"]

        selected_chain = tsdf[tsdf['chain'] == chain]
        selected_chain['voter'] = pd.Categorical(selected_chain['voter'], categories=similars, ordered=True)

        selected_val = selected_chain[selected_chain['voter'].isin(similars)].sort_values(by='voter')
        selected_val = selected_val[['voter', check, 'record_time']]
        selected_val = selected_val.dropna(subset=[check]).reset_index(drop=True)
        
        json_str = selected_val.to_json(orient='records')
        return jsonify(json_str), 200
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


if __name__ == '__main__':
    app.run(port=5002)