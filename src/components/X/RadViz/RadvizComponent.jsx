import React from 'react';
import style from './style.module.css';

const calculatePositions = (data, dimensions, radius) => {
  const numDimensions = dimensions.length;
  const angleStep = (2 * Math.PI) / numDimensions;
  const anchorPoints = dimensions.map((dim, i) => ({
    x: radius * Math.cos(i * angleStep - Math.PI / 2),
    y: radius * Math.sin(i * angleStep - Math.PI / 2),
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
  const borderColor = "lightgray"; // Set the border color to be lighter

  return (
    <svg className={style.radvizContainer} width={2.4 * radius} height={2.4 * radius} viewBox={`-${1.1 * radius} -${1.3 * radius} ${2.3 * radius} ${2.3 * radius}`}>
      <circle cx={0} cy={0} r={radius} stroke={borderColor} fill="none" />
      {dimensions.map((dim, i) => {
        const x = radius * Math.cos(i * ((2 * Math.PI) / dimensions.length) - Math.PI / 2);
        const y = radius * Math.sin(i * ((2 * Math.PI) / dimensions.length) - Math.PI / 2);
        return (
          <React.Fragment key={dim}>
            <line x1={0} y1={0} x2={x} y2={y} stroke={borderColor} />
            <circle cx={x} cy={y} r={5} fill={getColor(50)} /> {/* Add circle at the border */}
            <text
              x={x * 1.2} // Position the labels further outside the circle
              y={y * 1.2}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {dim}
            </text>
          </React.Fragment>
        );
      })}
      {positions.map((pos, index) => (
        <circle key={index} cx={pos.x} cy={pos.y} r={pos.size / 5} fill={getColor(pos.size)} opacity={0.3}/>
      ))}
    </svg>
  );
};

export default RadvizComponent;
