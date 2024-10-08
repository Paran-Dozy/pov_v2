import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelected, setVoter, setView } from '../../store';
import * as d3 from 'd3';
import styles from './style.module.css';

const RecommendViz = () => {
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

    const selected = useSelector((state) => state.select.selected);
    const view = useSelector((state) => state.view.view);
    const dispatch = useDispatch();

    const [similarityData, setSimilarityData] = useState([]);
    const [selectedLegends, setSelectedLegends] = useState([]);
    const svgRef = useRef();
    const previousPositions = useRef({});

    useEffect(() => {
        const fetchData = async () => {
            const data = {
                "chain": inputChain, 
                "voter": inputVoter,
                "weight": inputWeight,
                "inout_ratio": inOutRatio,
                "p_participation": inputParticipation,
                "p_passed": inputPassed,
                "p_match": inputMatch,
                "missblock": inputMissblock,
                "jailed_ratio": inputJailedRatio,
                "asset_value": inputAssetValue,
                "delegator": inputDelegator,
                "rank": inputRank,
                "commission": inputCommission,
                "day": inputDay,
                "selected": selected
            };
            try {
                const response = await fetch('http://localhost:5002/getSimilarity', {
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
                setSimilarityData(responseData);
                console.log('similarityNetwork', responseData);
            } catch (error) {
                console.error('There was an error!', error);
            }
        };
        fetchData();
    }, [setSimilarityData, selected, inputChain, inputVoter, inputWeight, inOutRatio, inputParticipation, inputPassed, inputMatch, inputMissblock, inputJailedRatio, inputAssetValue, inputDelegator, inputRank, inputCommission, inputDay]);

    useEffect(() => {
        if (!similarityData || similarityData.length === 0) return;

        const svg = d3.select(svgRef.current);
        const width = 785;
        const height = 420;
        const centerX = width / 2;
        const centerY = height / 2;
        const labels = ['contribution', 'stability', 'popularity', 'commission', 'period'];

        svg.selectAll('*').remove();

        const circles = [60, 120, 180];
        circles.forEach(radius => {
            svg.append('circle')
                .attr('cx', centerX)
                .attr('cy', centerY)
                .attr('r', radius)
                .attr('stroke', 'lightgrey')
                .attr('opacity', '0.4')
                .attr('stroke-width', '1')
                .attr('fill', 'none');
        });

        labels.forEach((label, index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180);
            const radius = 180;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 4)
                .attr('fill', 'lightgrey');

            svg.append('text')
                .attr('x', x)
                .attr('y', y - 10)
                .attr('fill', 'lightgrey')
                .attr('text-anchor', 'middle')
                .text(label)
                .attr('pointer-events', 'none');
        });

        const handleClick = (voter) => {
            dispatch(setVoter(voter));  
            dispatch(setSelected(true)); 
        };

        const getNodeColor = (d) => {
            if (view === 'grade') {
                if (d.final_score > 80) return '#58A270';  // Recommend
                if (d.final_score > 65) return '#A7D96A';  // Good
                if (d.final_score > 50) return '#FDAE61';  // Caution
                return '#F8877D';  // Not Recommend
            } else if (view === 'highScore') {
                const maxScore = Math.max(d.contribution_score, d.stability_score, d.popularity_score, d.commission_score, d.period_score);
                if (d.contribution_score === maxScore) return '#FFA28D';
                if (d.stability_score === maxScore) return '#A4C7E0';
                if (d.popularity_score === maxScore) return '#FFF39A';
                if (d.commission_score === maxScore) return '#CE977A';
                if (d.period_score === maxScore) return '#CFA4CF';
            }
        };

        const nodes = svg.selectAll('circle.node')
            .data(similarityData, d => d.voter)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'node')
                    .attr('fill', getNodeColor)
                    .attr('opacity', (d) => {
                        const nodeColor = getNodeColor(d);
                        if (selectedLegends.length === 0 || selectedLegends.includes(nodeColor)) {
                            return d.voter === similarityData[0].voter ? '0.8' : '0.6';
                        }
                        return '0.2';
                    })
                    .attr('r', (d) => d.final_score / 8)
                    .attr('cx', (d) => previousPositions.current[d.voter]?.x || centerX)
                    .attr('cy', (d) => previousPositions.current[d.voter]?.y || centerY)
                    .attr('stroke', 'grey')
                    .attr('stroke-width', 0.2)
                    .on('click', (event, d) => handleClick(d.voter))  
                    .on('mouseover', (event, d) => {
                        if (d !== similarityData[0]) {
                            d3.select(event.currentTarget)
                                .attr('opacity', 1);

                            svg.append('text')
                                .attr('id', 'tooltip')
                                .attr('x', previousPositions.current[d.voter].x)
                                .attr('y', previousPositions.current[d.voter].y + 4)
                                .attr('text-anchor', 'middle')
                                .attr('font-size', '12px')
                                .attr('fill', 'black')
                                .attr('pointer-events', 'none')
                                .text(d.voter);
                        }
                    })
                    .on('mouseout', (event, d) => {
                        if (d !== similarityData[0]) {
                            d3.select(event.currentTarget)
                                .attr('opacity', selectedLegends.length === 0 || selectedLegends.includes(getNodeColor(d)) ? 0.6 : 0.2);

                            svg.select('#tooltip').remove();
                        }
                    })
                    .call(enter => enter.transition().duration(750)
                        .attr('cx', (d, index) => {
                            let radius, angle;

                            if (index === 0) {
                                radius = 0;
                                angle = 0;
                            } else {
                                if (d.similarity >= 0.5) {
                                    radius = 60 + (1 - d.similarity) * 120;
                                } else if (d.similarity > 0) {
                                    radius = 120 + (0.5 - d.similarity) * 120;
                                } else {
                                    radius = 140 + Math.abs(d.similarity) * 60;
                                }
                                angle = ((d.degree - 90) * Math.PI) / 180;
                            }

                            const x = centerX + radius * Math.cos(angle);
                            previousPositions.current[d.voter] = { x, y: centerY + radius * Math.sin(angle) };
                            return x;
                        })
                        .attr('cy', (d, index) => previousPositions.current[d.voter].y)
                    ),
                update => update
                    .call(update => update.transition().duration(750)
                        .attr('cx', (d, index) => {
                            let radius, angle;

                            if (index === 0) {
                                radius = 0;
                                angle = 0;
                            } else {
                                if (d.similarity >= 0.5) {
                                    radius = 50 + (1 - d.similarity) * 100;
                                } else if (d.similarity > 0) {
                                    radius = 100 + (0.5 - d.similarity) * 100;
                                } else {
                                    radius = 150 + Math.abs(d.similarity) * 50;
                                }
                                angle = ((d.degree - 90) * Math.PI) / 180;
                            }

                            const x = centerX + radius * Math.cos(angle);
                            previousPositions.current[d.voter] = { x, y: centerY + radius * Math.sin(angle) };
                            return x;
                        })
                        .attr('cy', (d, index) => previousPositions.current[d.voter].y)
                    )
            );

        if (similarityData.length > 0) {
            svg.append('text')
                .attr('class', 'central-node-label')
                .attr('x', centerX)
                .attr('y', centerY + 4)
                .attr('text-anchor', 'middle')
                .attr('fill', 'black')
                .attr('font-size', '14px')
                .text(similarityData[0].voter);
        }

    }, [similarityData, dispatch, selectedLegends, view]);

    const legendData = view === 'grade' ? [
        { color: '#58A270', label: 'Recommend' },
        { color: '#A7D96A', label: 'Good' },
        { color: '#FDAE61', label: 'Caution' },
        { color: '#F8877D', label: 'Not Recommend' },
    ] : [
        { color: '#FFA28D', label: 'Contribution' },
        { color: '#A4C7E0', label: 'Stability' },
        { color: '#FFF39A', label: 'Popularity' },
        { color: '#CE977A', label: 'Commission' },
        { color: '#CFA4CF', label: 'Period' },
    ];

    const handleLegendClick = (color) => {
        setSelectedLegends((prevSelectedLegends) => {
            if (prevSelectedLegends.includes(color)) {
                return prevSelectedLegends.filter((item) => item !== color);
            } else {
                return [...prevSelectedLegends, color];
            }
        });
    };

    const handleRadioChange = (value) => {
        dispatch(setView(value === 'grade' ? 'grade' : 'highScore'));
        setSelectedLegends([]);
    };

    return (
        <div>
            <div className={styles.radioContainer}>
                <label className={styles['radio-label']}>
                    <input
                        type="radio"
                        value="grade"
                        checked={view === 'grade'}
                        onChange={() => handleRadioChange('grade')}
                        className={styles['radio-input']}
                    />
                    <span>Grade</span>
                </label>
                <label className={styles['radio-label']}>
                    <input
                        type="radio"
                        value="highScore"
                        checked={view === 'highScore'}
                        onChange={() => handleRadioChange('highScore')}
                        className={styles['radio-input']}
                    />
                    <span>High score</span>
                </label>
            </div>
            <div className={styles.legendContainer}>
                {legendData.map((item, index) => (
                    <div 
                        key={index} 
                        className={`${styles.legendItem} ${selectedLegends.includes(item.color) ? styles.selected : ''}`}
                        onClick={() => handleLegendClick(item.color)}
                    >
                        <div
                            className={styles.legendColor}
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <span className={styles.legendLabel}>{item.label}</span>
                    </div>
                ))}
                
            </div>
            <svg ref={svgRef} width="785" height="420" className={styles.svgContainer}></svg>
            <div className={styles.container}>
                <div 
                    className={`${styles.button} ${!selected ? styles.selected : styles.unselected}`}
                    onClick={() => dispatch(setSelected(false))}
                >
                    Recommend
                </div>
            </div>
            
        </div>
    );
};

export default RecommendViz;
