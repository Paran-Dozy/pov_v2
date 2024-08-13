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
    { backgroundColor: 'rgba(44, 136, 201, 0.4)', borderColor: '#2C88CB'},
    { backgroundColor: 'rgba(203, 39, 132, 0.4)', borderColor: '#CB2784'},
    { backgroundColor: 'rgba(241, 128, 32, 0.4)', borderColor: '#F18020'},
    { backgroundColor: 'rgba(43, 210, 210, 0.4)', borderColor: '#2BD2D2'},
    { backgroundColor: 'rgba(14, 133, 84, 0.4)', borderColor: '#0E8554'},
    { backgroundColor: 'rgba(246, 178, 41, 0.4)', borderColor: '#FFD276'},
  ].reverse();

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
      borderWidth: 1.5,
    })),
  };

  const options = {
    scale: {
      ticks: { beginAtZero: true },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw.toFixed(2);
            return `${label}: ${value}`;
          },
        },
      },
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div style={{ position: 'relative', height: '150px', width: '280px' }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default RadarChart;
