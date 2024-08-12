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
  const colors = [
    { backgroundColor: 'rgba(44, 136, 201, 0.4)', borderColor: '#94B4CB'},
    { backgroundColor: 'rgba(246, 178, 41, 0.4)', borderColor: '#F6D696'},
    { backgroundColor: 'rgba(132, 215, 61, 0.4)', borderColor: '#BBD7A5'},
    { backgroundColor: 'rgba(203, 39, 132, 0.4)', borderColor: '#CB9BB6'},
    { backgroundColor: 'rgba(43, 210, 210, 0.4)', borderColor: '#A2D2D2'},
    { backgroundColor: 'rgba(241, 128, 32, 0.4)', borderColor: '#F1BE91'},
  ];

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
      backgroundColor: colors[index % colors.length].backgroundColor,
      borderColor: colors[index % colors.length].borderColor,
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
