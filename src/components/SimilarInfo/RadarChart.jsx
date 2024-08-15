import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

const baseColorsGrade = ['#58A270', '#A7D96A', '#FDAE61', '#F8877D'];
const baseColorsHighScore = {
  contribution: '#F55240',
  stability: '#3291D1',
  popularity: '#F8DF2F',
  commission: '#AB5526',
  period: '#BD32BF',
};

const generatePalette = (baseColor) => {
  const palette = [baseColor];
  for (let i = 1; i < 6; i++) {
    palette.push(
      chroma(baseColor).set('hsl.h', chroma(baseColor).get('hsl.h') - 2 * i).saturate(-i * 0.4).brighten(i * -0.4).hex()
    );
  }
  return palette;
};

const generatePaletteHighScore = (baseColor, count) => {
  const palette = [];
  for (let i = 0; i < count; i++) {
    const adjustedColor = chroma(baseColor)
      .set('hsl.h', chroma(baseColor).get('hsl.h') + i * 5)
      .saturate(i * -0.35)
      .brighten(i * -0.05)
      .hex();
    palette.push(adjustedColor);
  }
  return palette;
};

const palettesGrade = baseColorsGrade.map(color => generatePalette(color));
const colorPalettesHighScore = Object.keys(baseColorsHighScore).reduce((acc, key) => {
  acc[key] = generatePaletteHighScore(baseColorsHighScore[key], 6);
  return acc;
}, {});

const getBaseColorIndex = (finalScore) => {
  if (finalScore > 80) return 0;
  if (finalScore > 65) return 1;
  if (finalScore > 50) return 2;
  return 3;
};

const getHighestScoreColor = (item) => {
  const scores = [
    { key: 'contribution', score: item.contribution_score },
    { key: 'stability', score: item.stability_score },
    { key: 'popularity', score: item.popularity_score },
    { key: 'commission', score: item.commission_score },
    { key: 'period', score: item.period_score },
  ];

  const highestScore = scores.reduce((max, current) => (current.score > max.score ? current : max), scores[0]);

  return highestScore.key;
};

const RadarChart = ({ infoData }) => {
  const dispatch = useDispatch();
  const view = useSelector((state) => state.view.view);
  const colorUsage = { 0: 0, 1: 0, 2: 0, 3: 0 };

  useEffect(() => {
    let colors = [];

    const sortedData = [...infoData].sort((a, b) => b.similarity - a.similarity);

    if (view === 'grade') {
      colors = sortedData.map((item) => {
        const baseColorIndex = getBaseColorIndex(item.final_score);
        const color = palettesGrade[baseColorIndex][colorUsage[baseColorIndex] % 6];
        colorUsage[baseColorIndex]++;
        return color;
      });
    } else if (view === 'highScore') {
      colors = sortedData.map((item, index) => {
        const colorCategory = getHighestScoreColor(item);
        return colorPalettesHighScore[colorCategory][index % colorPalettesHighScore[colorCategory].length];
      });
    }

    dispatch(setColors(colors));
  }, [infoData, dispatch, view]);

  const sortedData = [...infoData].sort((a, b) => b.similarity - a.similarity);

  const data = {
    labels: ['Contribution', 'Stability', 'Popularity', 'Commission', 'Period'],
    datasets: sortedData.map((item, index) => {
      let color;
      if (view === 'grade') {
        const baseColorIndex = getBaseColorIndex(item.final_score);
        color = palettesGrade[baseColorIndex][colorUsage[baseColorIndex] % 6];
      } else if (view === 'highScore') {
        const colorCategory = getHighestScoreColor(item);
        color = colorPalettesHighScore[colorCategory][index % colorPalettesHighScore[colorCategory].length];
      }

      return {
        label: item.voter,
        data: [
          item.contribution_score,
          item.stability_score,
          item.popularity_score,
          item.commission_score,
          item.period_score,
        ],
        backgroundColor: chroma(color).alpha(0.1).css(),
        borderColor: chroma(color).alpha(0.5).css(),
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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
