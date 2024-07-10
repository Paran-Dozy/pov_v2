/* eslint-disable no-unused-vars */
import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import allData from '../data/validator_score.json';
import '../styles/tooltip.css';
    
const TooltipContent = ({ circle, val, weightList }) => {
    const [selectedData, setSelectedData] = useState(allData.filter(item => item.val_id === circle.val_id));
    const [sortedData, setSortedData] = useState([]);

    useEffect(() => {
        const filteredData = allData.filter(item => item.val_id === circle.val_id);
        setSelectedData(filteredData);
    }, [circle]);

    useEffect(() => {
        const calScore = () => {
            const valRank = selectedData.map(cvval => {
                const ratioTotal = weightList.reduce((a, b) => +a + +b, 0);
                const contribution = +cvval.contribution * +weightList[0];
                const stability = +cvval.stability * +weightList[1];
                const popularity = +cvval.popularity * +weightList[2];
                const commission = +cvval.commission * +weightList[3];

                const score = (contribution + stability + popularity + commission) / ratioTotal;

                return {
                    chain_id: cvval.chain_id,
                    score: score
                };
            }).filter(Boolean);

            valRank.sort((a, b) => b.score - a.score);
            const matchingIndex = valRank.findIndex(item => item.chain_id === val.chain_id);
            if (matchingIndex !== -1) {
                const [matchingItem] = valRank.splice(matchingIndex, 1);
                valRank.unshift(matchingItem);
            }

            setSortedData(valRank);
        };

        if (selectedData.length > 0) {
            calScore();
        }
    }, [selectedData, weightList, val.chain_id]);

    // const maxScore = Math.max(...sortedData.map(d => d.score));

    return (
        <div className="tooltip-container">
            <div className="custom-tooltip">
                <div>ID: {circle.val_id}</div>
                <div>Score: {circle.score?.toFixed(2)}</div>
                {val && (
                    <>
                        {val.rank && <div>Rank: {val.rank}</div>}
                        {val.token && <div>Token: {val.token.toLocaleString('ko-KR')}</div>}
                        {val.voting_power && <div>Voting power: {val.voting_power.toLocaleString('ko-KR')}</div>}
                        {val.asset_value && <div>Asset value: {val.asset_value.toLocaleString('ko-KR')}</div>}
                        {val.commission && <div>Commission: {val.commission.toLocaleString('ko-KR')}</div>}
                        {val.missblock && <div>Missblock: {val.missblock.toLocaleString('ko-KR')}</div>}
                        {val.delegator && <div>Delegator: {val.delegator.toLocaleString('ko-KR')}</div>}
                        {val.jailed_ratio && <div>Jailed ratio: {val.jailed_ratio.toLocaleString('ko-KR')}</div>}
                    </>
                )}
                <div style={{ height: '10px' }}></div>
                <div style={{ height: '25px' }}>Activity in other Chain</div>
                <div className="scrollable-content">
                    <svg width="400" height={sortedData.length * 20 + 20}>
                        {sortedData.map((item, index) => (
                            <g key={index}>
                                <text x="0" y={index * 20 + 15} fontSize="12" fill={item.chain_id === val.chain_id ? 'red' : 'black'}>{item.chain_id}</text>
                                <rect
                                    x="100"
                                    y={index * 20}
                                    width={(item.score / 100) * 200}
                                    height="15"
                                    fill={item.chain_id === val.chain_id ? 'red' : 'black'}
                                >
                                    <title>{item.chain_id}: {item.score.toFixed(2)}</title>
                                </rect>
                                <text x="320" y={index * 20 + 15} fontSize="12" fill={item.chain_id === val.chain_id ? 'red' : 'black'}>{item.score.toFixed(2)}</text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
};

TooltipContent.propTypes = {
    circle: PropTypes.object.isRequired,
    val: PropTypes.object.isRequired,
    weightList: PropTypes.array.isRequired
};

export default TooltipContent;
