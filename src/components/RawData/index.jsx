import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setVoter, setSelected } from '../../store';
import style from './style.module.css';

function RawData() {
    const inputChain = useSelector((state) => state.chain.inputChain);
    const inputVoter = useSelector((state) => state.voter.inputVoter);
    const inputWeight = useSelector((state) => state.weight.inputWeight);
    const inOutRatio = useSelector((state) => state.input.inOutRatio);

    const inputParticipation = useSelector((state) => state.input.inputParticipation);
    const inputPassed = useSelector((state) => state.input.inputPassed);
    const inputMatch = useSelector((state) => state.input.inputMatch);
    const inputMissblock = useSelector((state) => state.input.inputMissblock);
    const inputJailedRatio = useSelector((state) => state.input.inputJailedRatio);
    const inputAssetValue = useSelector((state) => state.input.inputAssetValue);
    const inputDelegator = useSelector((state) => state.input.inputDelegator);
    const inputRank = useSelector((state) => state.input.inputRank);
    const inputCommission = useSelector((state) => state.input.inputCommission);
    const inputDay = useSelector((state) => state.input.inputDay);

    const [rawData, setRawData] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'final_score', direction: 'descending' });
    const dispatch = useDispatch();

    const headerMapping = {
        voter: 'Validator',
        final_score: 'Final Score',
        token: 'Token',
        rank: 'Token Rank',
        delegator: 'Delegator',
        voting_power: 'Voting Power',
        p_participation: 'Proposal Participation',
        p_passed: 'Proposal Passed',
        p_matchproposal: 'Proposal Match',
        missblock: 'Missblock',
        jailed_ratio: 'Jailed Ratio',
        commission: 'Commission',
        asset_value: 'Asset Value',
        day: 'Validation Period'
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = {
                chain: inputChain, 
                weight: inputWeight,
                inout_ratio: inOutRatio,
                p_participation: inputParticipation,
                p_passed: inputPassed,
                p_match: inputMatch,
                missblock: inputMissblock,
                jailed_ratio: inputJailedRatio,
                asset_value: inputAssetValue,
                delegator: inputDelegator,
                rank: inputRank,
                commission: inputCommission,
                day: inputDay
            };
            try {
                const response = await fetch('http://localhost:5002/getRaw', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = await response.json();
                responseData.sort((a, b) => b.final_score - a.final_score);
                setRawData(responseData);
                setSortedData(responseData);
            } catch (error) {
                console.error('There was an error!', error);
            }
        };
        fetchData();
    }, [inputChain, inputVoter, inputWeight, inOutRatio, inputParticipation, inputPassed, inputMatch, inputMissblock, inputJailedRatio, inputAssetValue, inputDelegator, inputRank, inputCommission, inputDay]);

    const handleVoterClick = (voter) => {
        dispatch(setVoter(voter));
        dispatch(setSelected(true));
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const sorted = [...sortedData].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setSortedData(sorted);
        setSortConfig({ key, direction });
    };

    const resetSort = () => {
        setSortedData(rawData);
        setSortConfig({ key: 'final_score', direction: 'descending' });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '';
    };

    const getRank = (index) => {
        const sortedByScore = [...sortedData].sort((a, b) => b.final_score - a.final_score);
        const rank = sortedByScore.findIndex((item) => item.final_score === sortedData[index].final_score) + 1;

        return rank;
    };

    const formatValue = (key, value) => {
        if (typeof value === 'number') {
            if (['final_score', 'p_participation', 'p_passed', 'p_match'].includes(key)) {
                return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            if (key === 'asset_value') {
                return Math.floor(value).toLocaleString();
            }
            return value.toLocaleString();
        }
        return value;
    };

    const getCellClass = (key) => {
        if (key === 'voter') {
            return style.leftAlign;
        }
        if (key === '*') {
            return style.centerAlign;
        }
        return style.rightAlign;
    };

    return (
        <div className={style.container}>
            <label className='ContainerTitle'>Raw Data</label>
            <div className={style.tableContainer}>
                <table className={style.table}>
                    <thead>
                        <tr>
                            <th 
                                className={style.centerAlign}
                                onClick={resetSort} 
                                style={{ cursor: 'pointer' }}
                            >
                                *
                            </th>
                            {sortedData.length > 0 && Object.keys(sortedData[0]).map((key) => (
                                <th 
                                    key={key} 
                                    onClick={() => handleSort(key)}
                                    style={{ cursor: 'pointer' }}
                                    className={getCellClass(key)}
                                >
                                    {headerMapping[key] || key} {getSortIndicator(key)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, index) => (
                            <tr key={index}>
                                <td className={style.centerAlign}>{getRank(index)}</td>
                                {Object.entries(row).map(([key, value], i) => (
                                    <td
                                        key={i}
                                        onClick={key === 'voter' ? () => handleVoterClick(value) : null}
                                        className={`${key === 'voter' ? style.clickable : ''} ${getCellClass(key)}`}
                                    >
                                        {formatValue(key, value)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RawData;
