/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';

function ClassificationInfo( { data = []}) {

    if (!Array.isArray(data)) {
        return null;
    }

    const metrics = ['contribution', 'stability', 'popularity', 'commission', 'score'];
    const shortLabels = {
      'contribution': 'cont.',
      'stability': 'stab.',
      'popularity': 'pop.',
      'commission': 'com.',
      'score': 'score'
    };
    const createViolinData = (metric, metricIndex) => {
        const metricData = data.filter(d => d.Metric === metric);
        const clusters = [...new Set(metricData.map(d => d.kmeanscluster))];
        return clusters.map((cluster, i) => {
          const values = metricData.filter(d => d.kmeanscluster === cluster).map(d => d.Value);
          const offset = (i - (clusters.length - 1) / 2) * 0.4;
          return {
            type: 'violin',
            x: Array(values.length).fill(metricIndex + offset),
            y: values,
            name: `Cluster ${cluster}`,
            box: {
              visible: true
            },
            boxpoints: true,
            meanline: {
              visible: true
            },
            line: {
              color: cluster === 0 ? "#B8B8F0" : cluster === 1 ? "#94DE81" : '#FFC56F'
            },
            opacity: 1.0,
            width: 0.3,
            offsetgroup: i.toString(), // 클러스터별로 오프셋 그룹 설정
            alignmentgroup: metric, // 같은 메트릭에 대한 플롯 정렬
            hoveron: 'points+kde'
          };
        });
      };

    const violinData = metrics.flatMap(createViolinData);


    return (
        <div className="class-info-container">
            <div>
                <label>Classification Info</label>
            </div>
            <Plot
                data={violinData}
                layout={{
                    width: 293,
                    height: 250,
                    yaxis: {
                        zeroline: false,
                    },
                    xaxis: {
                      tickangle: 0,
                      tickvals: metrics.map((metric, i) => i),
                      ticktext: metrics.map(metric => shortLabels[metric])
                    },
                    violinmode: 'group',
                    showlegend: false,
                    margin: {
                        l: 20,  // left margin
                        r: 0,  // right margin
                        b: 60,  // bottom margin
                        t: 30,  // top margin
                        pad: 0  // padding
                      },
                }}
            />
        </div>
    );
}

export default ClassificationInfo;

