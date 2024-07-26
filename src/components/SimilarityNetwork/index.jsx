import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const NetworkComponent = () => {
  const inputChain = useSelector((state) => state.chain.inputChain);
  const inputWeight = useSelector((state) => state.weight.inputWeight);
  const conditionScore = useSelector((state) => parseFloat(state.condition.conditionScore));
  const conditionMissblock = useSelector((state) => parseFloat(state.condition.conditionMissblock));
  const conditionJailed = useSelector((state) => parseFloat(state.condition.conditionJailed));
  const conditionTokenOutlier = useSelector((state) => parseFloat(state.condition.conditionTokenOutlier));
  const conditionParticipation = useSelector((state) => parseFloat(state.condition.conditionParticipation));

  const [gradeData, setGradeData] = useState([]);
  const [similarityData, setSimilarityData] = useState([]);

  const svgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
    const data = {
                    "chain": inputChain, 
                    "weight": inputWeight,
                    "score_condition": conditionScore,
                    "missblock": conditionMissblock,
                    "jailed": conditionJailed,
                    "token_outlier": conditionTokenOutlier,
                    "participation": conditionParticipation,
                    "only_in": true,
                    "percentage": [0.5, 0.5] 
                  };
      try {
        const response = await fetch('http://localhost:5002/similarity', {
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
        setGradeData(responseData['data']);
        setSimilarityData(responseData['similarity']);
      } catch (error) {
        console.error('There was an error!', error);
      }
    };
    fetchData();
  }, [setGradeData, setSimilarityData, inputChain, inputWeight, conditionScore, conditionMissblock, conditionJailed, conditionTokenOutlier, conditionParticipation]);

  return (
    <div>
      
    </div>
  );
}

export default NetworkComponent;
