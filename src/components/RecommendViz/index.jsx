import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';

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

    const [similarityData, setSimilarityData] = useState([]);
    const svgRef = useRef();
    const previousPositions = useRef({}); // Store the previous positions of nodes

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
                "day": inputDay
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
    }, [setSimilarityData, inputChain, inputVoter, inputWeight, inOutRatio, inputParticipation, inputPassed, inputMatch, inputMissblock, inputJailedRatio, inputAssetValue, inputDelegator, inputRank, inputCommission, inputDay]);

    useEffect(() => {
        if (!similarityData || similarityData.length === 0) return;

        const svg = d3.select(svgRef.current);
        const width = 785;
        const height = 420;
        const centerX = width / 2;
        const centerY = height / 2;
        const labels = ['contribution', 'stability', 'popularity', 'commission', 'period'];

        svg.selectAll('*').remove();

        const circles = [50, 100, 150];
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
            const radius = 150;
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
                .text(label);
        });

        const nodes = svg.selectAll('circle.node')
            .data(similarityData, d => d.voter) // Use 'voter' as a key for stable selection
            .join(
                enter => enter.append('circle')
                    .attr('class', 'node')
                    .attr('fill', (d) => {
                        if (d.final_score > 80) return '#47924a';
                        if (d.final_score > 65) return '#8BC34A';
                        if (d.final_score > 50) return '#FF9800';
                        return '#F44336';
                    })
                    .attr('opacity', (d, i) => (i === 0 ? '0.9' : '0.6'))
                    .attr('r', (d) => d.final_score / 5)
                    .attr('cx', (d) => previousPositions.current[d.voter]?.x || centerX)
                    .attr('cy', (d) => previousPositions.current[d.voter]?.y || centerY)
                    .call(enter => enter.transition().duration(750)
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
                                angle = (d.degree * Math.PI) / 180;
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
                                angle = (d.degree * Math.PI) / 180;
                            }

                            const x = centerX + radius * Math.cos(angle);
                            previousPositions.current[d.voter] = { x, y: centerY + radius * Math.sin(angle) };
                            return x;
                        })
                        .attr('cy', (d, index) => previousPositions.current[d.voter].y)
                    )
            );

        // Add central node's name in the middle
        if (similarityData.length > 0) {
            svg.append('text')
                .attr('class', 'central-node-label')
                .attr('x', centerX)
                .attr('y', centerY - 10)
                .attr('text-anchor', 'middle')
                .attr('fill', 'black')
                .attr('font-size', '14px')
                .text(similarityData[0].voter);
        }

    }, [similarityData]);

    return (
        <div>
            <svg ref={svgRef} width="785" height="420"></svg>
        </div>
    );
};

export default RecommendViz;
