import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

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

        const svg = svgRef.current;
        const width = 785;
        const height = 420;
        const centerX = width / 2;
        const centerY = height / 2;

        svg.innerHTML = '';

        const circles = [50, 100, 150];
        circles.forEach(radius => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', centerX);
            circle.setAttribute('cy', centerY);
            circle.setAttribute('r', radius);
            circle.setAttribute('stroke', 'lightgrey');
            circle.setAttribute('opacity', '0.4');
            circle.setAttribute('stroke-width', '1');
            circle.setAttribute('fill', 'none');
            svg.appendChild(circle);
        });

        similarityData.forEach((voter, index) => {
            const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            let radius, angle;

            if (index === 0) {
                radius = 0;
                angle = 0;
                voter.final_score += 50;
            } else {
                if (voter.similarity >= 0.5) {
                    radius = 50 + (1 - voter.similarity) * 100;
                } else if (voter.similarity > 0) {
                    radius = 100 + (0.5 - voter.similarity) * 100;
                } else {
                    radius = 150 + Math.abs(voter.similarity) * 50;
                }
                angle = (voter.degree * Math.PI) / 180;
            }

            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            let color;
            if (voter.final_score > 80) {
                color = '#47924a';
                node.setAttribute('opacity', '0.9');
            } else if (voter.final_score > 65) {
                color = '#8BC34A';
                node.setAttribute('opacity', '0.6');
            } else if (voter.final_score > 50) {
                color = '#FF9800';
                node.setAttribute('opacity', '0.6');
            } else {
                color = '#F44336';
                node.setAttribute('opacity', '0.6');
            }

            node.setAttribute('cx', x);
            node.setAttribute('cy', y);
            node.setAttribute('r', voter.final_score / 5);
            node.setAttribute('fill', color);
            
            svg.appendChild(node);

            if (index === 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', y + 5);
                text.setAttribute('fill', 'black');
                text.textContent = voter.voter;
                svg.appendChild(text);
            }
        });
    }, [similarityData]);

    return (
        <div>
            <svg ref={svgRef} width="785" height="420"></svg>
        </div>
    );
}

export default RecommendViz;
