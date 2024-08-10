import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import style from './style.module.css';

function HistogramSlider({ data, indicator, range: initialRange, onRangeChange }) {
    const [range, setRange] = useState(initialRange);

    useEffect(() => {
        setRange(initialRange);
    }, [initialRange]);

    const handleRangeChange = (newRange) => {
        setRange(newRange);
    };

    const handleAfterChange = (newRange) => {
        onRangeChange(newRange);
    };

    const handleInputChange = (index, event) => {
        const newRange = [...range];
        newRange[index] = parseFloat(event.target.value) || 0;
        setRange(newRange);
        onRangeChange(newRange);
    };

    let minValue, maxValue;
    switch (indicator) {
        case 'Participation':
        case 'Passed':
        case 'Match':
        case 'Jailed Ratio':
        case 'Commission':
            minValue = 0;
            maxValue = 1;
            break;
        case 'Missblock':
        case 'Asset Value':
        case 'Delegator':
        case 'Day':
            minValue = 0;
            maxValue = Math.max(...data);
            break;
        case 'Rank':
            minValue = 1;
            maxValue = Math.max(...data);
            break;
        default:
            minValue = 0;
            maxValue = Math.max(...data);
    }

    const numBins = 20;
    const binWidth = (maxValue - minValue) / numBins;

    const bins = Array(numBins).fill(0);
    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - minValue) / binWidth), numBins - 1);
        bins[binIndex]++;
    });

    const maxBinCount = Math.max(...bins);

    const formatValue = (value) => {
        switch (indicator) {
            case 'Participation':
            case 'Passed':
            case 'Match':
            case 'Jailed Ratio':
                return value.toFixed(4);
            case 'Commission':
                return value.toFixed(2);
            case 'Missblock':
            case 'Asset Value':
            case 'Delegator':
            case 'Rank':
            case 'Day':
            default:
                return Math.round(value);
        }
    };

    return (
        <div className={style.histogramSliderContainer}>
            <div className={style.indicatorLabel}>
                <span>{indicator} Range</span>
            </div>
            <div className={style.histogramContainer}>
                {bins.map((count, index) => {
                    const binMinValue = minValue + index * binWidth;
                    const binMaxValue = binMinValue + binWidth;
                    const barClass = (binMinValue >= range[0] && binMaxValue <= range[1]) ? style.selected : style.unselected;
                    return <div key={index} className={`${style.bar} ${barClass}`} style={{ height: `${(count / maxBinCount) * 100}%` }}></div>;
                })}
            </div>
            <div className={style.sliderContainer}>
                <Slider
                    range
                    min={minValue}
                    max={maxValue}
                    step={binWidth}
                    value={range}
                    onChange={handleRangeChange}
                    onAfterChange={handleAfterChange}
                    allowCross={false}
                    trackStyle={[{ backgroundColor: '#87CEFA' }]} // 슬라이더 색상
                    handleStyle={[{ borderColor: '#87CEFA' }, { borderColor: '#87CEFA' }]}
                />
            </div>
            <div className={style.rangeInputContainer}>
                <input
                    type="number"
                    value={formatValue(range[0])}
                    onChange={(e) => handleInputChange(0, e)}
                    className={style.rangeInput}
                />
                <span className={style.rangeSeparator}>-</span>
                <input
                    type="number"
                    value={formatValue(range[1])}
                    onChange={(e) => handleInputChange(1, e)}
                    className={style.rangeInput}
                />
            </div>
        </div>
    );
}

export default HistogramSlider;
