import pandas as pd
import numpy as np

from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from scipy.spatial import distance

from flask import Flask, request, jsonify
from flask_cors import CORS

import json
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

score_df = pd.read_csv('./fin_score.csv').drop(columns=['Unnamed: 0', 'Unnamed: 0.1'])
score_df = score_df.rename(columns={'chain': 'chain_id', 'voter': 'val_id', 'contribution_s': 'contribution', 'stability_s': 'stability', 'popularity_s': 'popularity', 'commission_s': 'commission'})
fin_val = pd.read_csv('./fin_val.csv').drop(columns=['Unnamed: 0'])
fin_val = fin_val.rename(columns={'chain': 'chain_id', 'voter': 'val_id'})
fin_val = fin_val.drop(columns=["contribution_score",	"stability_score","popularity_score","commission_score"])
tsdf = pd.read_csv('./timeSeriesVal.csv').drop(columns=['Unnamed: 0'])
tsdf = tsdf.rename(columns={'chain': 'chain_id'})

def weighting(chain_id, weightList):
    select_chain = score_df[score_df['chain_id'] == chain_id].copy()
    for i, col in enumerate(['contribution', 'stability', 'popularity', 'commission']):
        select_chain[col] = select_chain[col] * weightList[i] / sum(weightList)
    
    temp = select_chain.drop(columns=['chain_id', 'val_id'])
    wcss = [KMeans(n_clusters=i, init='k-means++', max_iter=300, n_init=10, random_state=0).fit(temp).inertia_ for i in range(1, 11)]
    k_optimal = np.argmax(np.diff(wcss) * -1) + 2
    return temp, select_chain, k_optimal

def apply_pca_and_kmeans(select_chain,temp, k_optimal):
    kmeans = KMeans(n_clusters=k_optimal, init='k-means++', max_iter=200, random_state=42)
    select_chain['kmeanscluster'] = kmeans.fit_predict(temp)
    
    pca = PCA(n_components=2, random_state=0)
    pca_transformed = pca.fit_transform(temp)
    select_chain["ftr1"], select_chain["ftr2"] = pca_transformed[:, 0], pca_transformed[:, 1]
    select_chain['score'] = temp.sum(axis=1)
    return select_chain, pca, kmeans


@app.route('/')
def home():
    return "Hello, Flask server is running"

@app.route('/pca', methods=['POST'])
def pca():
    try:
        data = request.get_json()

        chain_id = data['chain_id']
        weightList = data['weightList']

        select_chain = score_df[score_df['chain_id'] == chain_id]
        val_list = select_chain['val_id']

        select_chain['contribution'] = select_chain['contribution'] * weightList[0] / sum(weightList)
        select_chain['stability'] = select_chain['stability'] * weightList[1] / sum(weightList)
        select_chain['popularity'] = select_chain['popularity'] * weightList[2] / sum(weightList)
        select_chain['commission'] = select_chain['commission'] * weightList[3] / sum(weightList)
        
        temp = select_chain.drop(columns=['chain_id', 'val_id'])

        # WCSS 값을 저장할 리스트
        wcss = []

        for i in range(1, 11):
            kmeans = KMeans(n_clusters=i, init='k-means++', max_iter=300, n_init=10, random_state=0)
            kmeans.fit(temp)
            wcss.append(kmeans.inertia_)

        # WCSS의 감소율 계산
        wcss_diff = np.diff(wcss) * -1  # WCSS가 감소하므로, 감소율을 양수로 만들기 위해 -1을 곱함

        # WCSS 감소율의 변화율(2차 도함수) 계산
        k_optimal = np.argmax(wcss_diff) + 2

        # 4개 값 각각으로만 군집화 함
        kmeans = KMeans(n_clusters=k_optimal, init='k-means++', max_iter=300,random_state=0, n_init=10)

        kmeans.fit_transform(temp)
        select_chain['kmeanscluster']=kmeans.labels_

        pca = PCA(n_components=2, random_state=0)
        pca_transformed = pca.fit_transform(temp)

        select_chain["ftr1"] = pca_transformed[:,0]
        select_chain["ftr2"] = pca_transformed[:,1]
        select_chain['score'] = select_chain['contribution'] + select_chain['stability'] + select_chain['popularity'] + select_chain['commission']
        select_chain['val_id'] = val_list
        select_chain = select_chain.sort_values(by='score', ascending=False)

        json_str = select_chain.to_json(orient='records')
        
        return jsonify(json_str), 200
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/classInfo', methods=['POST'])
def classInfo():
    try:
        data = request.get_json()

        chain_id = data['chain_id']
        weightList = data['weightList']

        select_chain = score_df[score_df['chain_id'] == chain_id]
        val_list = select_chain['val_id']

        select_chain['contribution'] = select_chain['contribution'] * weightList[0] / sum(weightList)
        select_chain['stability'] = select_chain['stability'] * weightList[1] / sum(weightList)
        select_chain['popularity'] = select_chain['popularity'] * weightList[2] / sum(weightList)
        select_chain['commission'] = select_chain['commission'] * weightList[3] / sum(weightList)
        
        temp = select_chain.drop(columns=['chain_id', 'val_id'])

        # WCSS 값을 저장할 리스트
        wcss = []

        for i in range(1, 11):
            kmeans = KMeans(n_clusters=i, init='k-means++', max_iter=300, n_init=10, random_state=0)
            kmeans.fit(temp)
            wcss.append(kmeans.inertia_)

        # WCSS의 감소율 계산
        wcss_diff = np.diff(wcss) * -1  # WCSS가 감소하므로, 감소율을 양수로 만들기 위해 -1을 곱함

        # WCSS 감소율의 변화율(2차 도함수) 계산
        k_optimal = np.argmax(wcss_diff) + 2

        # 4개 값 각각으로만 군집화 함
        kmeans = KMeans(n_clusters=k_optimal, init='k-means++', max_iter=300,random_state=0, n_init=10)

        kmeans.fit_transform(temp)
        select_chain['kmeanscluster']=kmeans.labels_

        pca = PCA(n_components=2, random_state=0)
        pca_transformed = pca.fit_transform(temp)

        select_chain["ftr1"] = pca_transformed[:,0]
        select_chain["ftr2"] = pca_transformed[:,1]
        select_chain['score'] = select_chain['contribution'] + select_chain['stability'] + select_chain['popularity'] + select_chain['commission']
        select_chain['val_id'] = val_list
        select_chain = select_chain.sort_values(by='score', ascending=False)

        melted_df = pd.melt(select_chain, id_vars=['kmeanscluster'], value_vars=['contribution', 'stability', 'popularity', 'commission', 'score'], var_name='Metric', value_name='Value')

        json_str = melted_df.to_json(orient='records')
        
        return jsonify(json_str), 200
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()

        chain_id, weightList = data["selected"]["chain_id"], data["selected"]["weightList"]
        v1 = fin_val[fin_val['chain_id']==chain_id]
        temp, select_chain, k_optimal = weighting(chain_id, weightList)
        select_chain, pca, kmeans = apply_pca_and_kmeans(select_chain,temp, k_optimal)

        pairs = data["interested"]
        interested = pd.DataFrame(columns=['contribution', 'stability', 'popularity', 'commission'])
        its = pd.DataFrame(columns=["chain_id","val_id"])

        for pair in pairs:
            new_row = [{'chain_id': pair['chain_id'], 'val_id':pair["val_id"]}]
            its = pd.concat([its, pd.DataFrame(new_row)], ignore_index=True)
            found = score_df[(score_df['chain_id'] == pair["chain_id"]) & (score_df['val_id'] == pair["val_id"])]
            if not found.empty:
                # Series를 DataFrame으로 변환하고 interested DataFrame에 추가
                interested = pd.concat([interested, found.iloc[[0]].iloc[:,2:6]], ignore_index=True)

        for i, col in enumerate(['contribution', 'stability', 'popularity', 'commission']):
            interested[col] = interested[col] * weightList[i] / sum(weightList)

        pca_predict = pca.transform(interested)
        interested["kmeanscluster"], interested["ftr1"], interested["ftr2"] = kmeans.predict(interested), pca_predict[:, 0], pca_predict[:, 1]
        interested['score'] = interested.sum(axis=1)
        its = pd.concat([its, interested], axis=1,ignore_index=True)
        its.columns = select_chain.columns

        # Scaler 정의
        scaler = StandardScaler()
        v = scaler.fit_transform(v1.iloc[:, 2:])

        sim_id = []
        sim = []

        target=pd.DataFrame()
        for idx, row in its.iterrows():
            target = pd.concat([target,fin_val[(fin_val['chain_id'] == row['chain_id']) & (fin_val['val_id'] == row['val_id'])].iloc[:, 2:]])
        target = scaler.transform(target)
        target = np.mean(target, axis=0)
        
        md_1 = []
        for row_2 in v:
            md_1.append(distance.minkowski(target.flatten(), row_2.flatten(), p=1))
        md_1 = np.array(md_1)
        ##

        # 가장 거리가 가까운 행의 인덱스 찾기
        min_distance_index = np.argsort(md_1)
        sim_id.append(v1["val_id"].iloc[min_distance_index[:3]].tolist())
        sim.append(md_1[min_distance_index[:3]].tolist())

        interested_json = its.to_json(orient='records')
        # 두 JSON 객체를 하나의 딕셔너리로 결합
        result = {
            'interested': json.loads(interested_json),
            'sim_id': sim_id,
            'sim': sim
        }
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/timeSeriesData', methods=['POST'])
def timeSeriesData():
    try:
        data = request.get_json()

        chain_id, selected, check = data["chain_id"], data["selected"], data["check"]

        selected_chain = tsdf[tsdf['chain_id'] == chain_id]
        selected_chain['val_id'] = pd.Categorical(selected_chain['val_id'], categories=selected, ordered=True)

        selected_val = selected_chain[selected_chain['val_id'].isin(selected)].sort_values(by='val_id')
        selected_val = selected_val[['val_id', check, 'record_time']]
        selected_val = selected_val.dropna(subset=[check]).reset_index(drop=True)
        
        json_str = selected_val.to_json(orient='records')
        return jsonify(json_str), 200
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(port=5002)