import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import style from './style.module.css';

function HistogramSlider({ data, onRangeChange }) {
    const [range, setRange] = useState([0, 0]);

    useEffect(() => {
        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        setRange([minValue, maxValue]);
    }, [data]);

    const handleRangeChange = (newRange) => {
        setRange(newRange);
        onRangeChange(newRange);
    };

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const numBins = 20; // You can adjust the number of bins
    const binWidth = (maxValue - minValue) / numBins;

    const bins = Array(numBins).fill(0);
    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - minValue) / binWidth), numBins - 1);
        bins[binIndex]++;
    });

    const maxBinCount = Math.max(...bins);

    return (
        <div className={style.histogramSliderContainer}>
            <div className={style.histogramContainer}>
                {bins.map((count, index) => {
                    const binMinValue = minValue + index * binWidth;
                    const binMaxValue = binMinValue + binWidth;
                    const barStyle = {
                        height: `${(count / maxBinCount) * 100}%`,
                        backgroundColor: (binMinValue >= range[0] && binMaxValue <= range[1]) ? '#d0006f' : '#d3d3d3',
                        position: 'relative',
                    };
                    return <div key={index} className={style.bar} style={barStyle}></div>;
                })}
            </div>
            <div className={style.sliderContainer}>
                <div className={style.rangeLabel}>{range[0]}</div>
                <Slider
                    range
                    min={minValue}
                    max={maxValue}
                    step={binWidth}
                    value={range}
                    onChange={handleRangeChange}
                    allowCross={false}
                    trackStyle={[{ backgroundColor: '#d0006f' }]}
                    handleStyle={[{ borderColor: '#d0006f' }, { borderColor: '#d0006f' }]}
                />
                <div className={style.rangeLabel}>{range[1]}</div>
            </div>
        </div>
    );
}

export default HistogramSlider;
