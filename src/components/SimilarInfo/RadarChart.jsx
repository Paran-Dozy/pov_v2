import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const RadarChart = ({ infoData }) => {
  const data = {
    labels: ['Contribution', 'Stability', 'Popularity', 'Commission', 'Period'],
    datasets: infoData.map((item, index) => ({
      label: item.voter,
      data: [
        item.contribution_score,
        item.stability_score,
        item.popularity_score,
        item.commission_score,
        item.period_score,
      ],
      backgroundColor: `rgba(${100 + index * 50}, ${150 + index * 30}, ${200 - index * 20}, 0.2)`,
      borderColor: `rgba(${100 + index * 50}, ${150 + index * 30}, ${200 - index * 20}, 1)`,
      borderWidth: 1,
    })),
  };

  const options = {
    scale: {
      ticks: { beginAtZero: true },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div style={{ position: 'relative', height: '150px', width: '280px' }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default RadarChart;
