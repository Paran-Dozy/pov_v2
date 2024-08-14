import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setColors } from '../../store';
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
import chroma from 'chroma-js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const baseColors = ['#58A270', '#A7D96A', '#FDAE61', '#F8877D'];

const generatePalette = (baseColor) => {
  const palette = [baseColor];
  for (let i = 1; i < 6; i++) {
    palette.push(
      chroma(baseColor).set('hsl.h', chroma(baseColor).get('hsl.h') - 2 * i).saturate(-i * 0.4).brighten(i * -0.4).hex()
    );
  }
  return palette;
};

const palettes = baseColors.map(color => generatePalette(color));

const getBaseColorIndex = (finalScore) => {
  if (finalScore > 80) return 0;
  if (finalScore > 65) return 1;
  if (finalScore > 50) return 2;
  return 3;
};

const RadarChart = ({ infoData }) => {
  const dispatch = useDispatch();
  const colorUsage = { 0: 0, 1: 0, 2: 0, 3: 0 };
  
  useEffect(() => {
    const colors = [];

    sortedData.forEach((item) => {
      const baseColorIndex = getBaseColorIndex(item.final_score);
      const color = palettes[baseColorIndex][colorUsage[baseColorIndex] % 6];
      colorUsage[baseColorIndex]++;
      colors.push(color);
    });

    dispatch(setColors(colors));
  }, [infoData, dispatch]);

  const sortedData = [...infoData].sort((a, b) => b.similarity - a.similarity);

  const data = {
    labels: ['Contribution', 'Stability', 'Popularity', 'Commission', 'Period'],
    datasets: sortedData.map((item, index) => {
      const baseColorIndex = getBaseColorIndex(item.final_score);
      const color = palettes[baseColorIndex][colorUsage[baseColorIndex] % 6];

      colorUsage[baseColorIndex]++;

      return {
        label: item.voter,
        data: [
          item.contribution_score,
          item.stability_score,
          item.popularity_score,
          item.commission_score,
          item.period_score,
        ],
        backgroundColor: chroma(color).alpha(0.3).css(),
        borderColor: chroma(color).alpha(0.6).css(),
        borderWidth: 1.5,
      };
    }),
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
