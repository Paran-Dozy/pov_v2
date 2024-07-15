import React from 'react';
import style from './style.module.css';

const calculatePositions = (data, dimensions, radius) => {
  const numDimensions = dimensions.length;
  const angleStep = (2 * Math.PI) / numDimensions;
  const anchorPoints = dimensions.map((dim, i) => ({
    x: radius * Math.cos(i * angleStep),
    y: radius * Math.sin(i * angleStep),
  }));

  return Array.isArray(data) ? data.map((point) => {
    const sumValues = dimensions.reduce((sum, dim) => sum + point[`${dim.toLowerCase()}_score`], 0);
    const x = dimensions.reduce((acc, dim, i) => acc + (point[`${dim.toLowerCase()}_score`] * anchorPoints[i].x), 0) / sumValues;
    const y = dimensions.reduce((acc, dim, i) => acc + (point[`${dim.toLowerCase()}_score`] * anchorPoints[i].y), 0) / sumValues;
    const size = point.total_score;
    return { x, y, size };
  }) : [];
};

const getColor = (score) => {
  if (score < 40) return '#AFEC00';
  if (score < 75) return '#00CAA6';
  return '#1C19AD';
};

const RadvizComponent = ({ data, dimensions, radius }) => {
  const positions = calculatePositions(data, dimensions, radius);

  return (
    <svg className={style.radvizContainer} width={2 * radius} height={2 * radius} viewBox={`-${radius} -${radius} ${2 * radius} ${2 * radius}`}>
      {positions.map((pos, index) => (
        <circle key={index} cx={pos.x} cy={pos.y} r={pos.size / 5} fill={getColor(pos.size)} opacity={0.3}/>
      ))}
      {dimensions.map((dim, i) => (
        <text key={dim} x={radius * Math.cos(i * ((2 * Math.PI) / dimensions.length))} y={radius * Math.sin(i * ((2 * Math.PI) / dimensions.length))} textAnchor="middle">
          {dim}
        </text>
      ))}
    </svg>
  );
};

export default RadvizComponent;
