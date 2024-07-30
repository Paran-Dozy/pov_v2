import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';

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

  useEffect(() => {
    const width = 785;
    const height = 420;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .call(d3.zoom().on('zoom', (event) => {
        svg.attr('transform', event.transform);
      }))
      .append('g');

    const gradeMap = {};
    gradeData.forEach(d => {
      gradeMap[d.voter] = {
        final_score: parseFloat(d.final_score),
        final_grade: d.final_grade
      };
    });

    const threshold = 0.7;

    const nodes = Object.keys(similarityData).map(voter => ({
      id: voter,
      final_score: Math.min(Math.max(gradeMap[voter]?.final_score * 0.3, 2), 50),
      final_grade: gradeMap[voter]?.final_grade || '주의'
    }));

    const links = [];

    Object.keys(similarityData).forEach(source => {
      Object.keys(similarityData[source]).forEach(target => {
        if (source !== target && parseFloat(similarityData[source][target]) > threshold) {
          links.push({
            source,
            target,
            value: parseFloat(similarityData[source][target])
          });
        }
      });
    });

    const colorMap = {
      '추천': 'green',
      '양호': 'lightgreen',
      '주의': 'orange',
      '비추천': 'red'
    };

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => d.final_score + 2));

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('stroke', 'darkgray');

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.final_score)
      .attr('fill', d => colorMap[d.final_grade])
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('title')
      .text(d => d.id);

    simulation
      .nodes(nodes)
      .on('tick', ticked);

    simulation.force('link')
      .links(links);

    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, [gradeData, similarityData]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default NetworkComponent;
