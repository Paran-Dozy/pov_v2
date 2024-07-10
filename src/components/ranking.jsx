/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../styles/ranking.css';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCircleId } from '../store';


function Ranking({ valList }) {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const dispatch = useDispatch();
    const selectedCircleIds = useSelector((state) => state.circles.selectedCircleIds);

    const handleLabelClick = (val_id) => {
        dispatch(toggleCircleId(val_id));
    };
    
    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: valList.map(item => item.val_id), // 각 validator의 ID를 레이블로 사용
                datasets: [
                    {
                        label: 'Contribution',
                        data: valList.map(val => val.contribution),
                        backgroundColor: valList.map(val => selectedCircleIds.includes(val.val_id) ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 99, 132, 0.55)'),
                    },
                    {
                        label: 'Stability',
                        data: valList.map(val => val.stability),
                        backgroundColor: valList.map(val => selectedCircleIds.includes(val.val_id) ? 'rgba(54, 162, 235, 1)' : 'rgba(54, 162, 235, 0.55)'),
                    },
                    {
                        label: 'Popularity',
                        data: valList.map(val => val.popularity),
                        backgroundColor: valList.map(val => selectedCircleIds.includes(val.val_id) ? 'rgba(255, 206, 86, 1)' : 'rgba(255, 206, 86, 0.55)'),
                    },
                    {
                        label: 'Commission',
                        data: valList.map(val => val.commission),
                        backgroundColor: valList.map(val => selectedCircleIds.includes(val.val_id) ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 192, 0.55)'),
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            offset: true
                          },
                        position: 'top'
                    },
                    y: {
                        stacked: true,
                        maxBarThickness: 15,
                        minBarThickness: 15,
                        categoryPercentage: 0.8,
                        barPercentage: 0.9,
                        ticks: {
                            align: 'start',
                            font: {
                                family: 'Roboto'
                            }
                        }
                    }
                },
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            padding: 5,
                            font: {
                                family: 'Roboto'
                            }
                        },
                        align: 'left',
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'white',
                        borderWidth: 1,
                        titleFont: {
                            family: 'Roboto'
                        },
                        bodyFont: {
                            family: 'Roboto'
                        }
                    }
                },
                animation: false,
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const val_id = valList[index].val_id;
                        handleLabelClick(val_id);
                    }
                }
            }
        });
        chartInstanceRef.current = chart;

    return () => chart.destroy();
  }, [valList, selectedCircleIds]);
  
  const chartHeight = valList.length >= 7 ? valList.length * 30 : valList.length * 10 * (10 - valList.length);

  return (
    <div className="stacked-bar-chart-container">
      <div className="labelDiv">
        <label className="valRank">Validator Ranking</label>
      </div>
      <div className="stacked-bar-chart" style={{ height: chartHeight }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

Ranking.propTypes = {
  valList: PropTypes.array.isRequired,
};

export default Ranking;
