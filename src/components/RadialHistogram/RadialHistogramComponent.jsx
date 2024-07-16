import React, { useEffect } from 'react';
import style from './style.module.css';

function RadialHistogramComponent({ validatorData }) {
    const weight_score_sum = validatorData.reduce((sum, validator) => sum + validator.weight_score, 0);
    const average_score = validatorData.reduce((sum, validator) => sum + validator.total_score, 0) / validatorData.length;

    const classifyAndSortValidators = () => {
        const green = [];
        const orange = [];
        const red = [];

        validatorData.forEach((validator) => {
            const conditions = [
                validator.total_score > average_score,
                validator.missblock === 0,
                validator.jailed_ratio === 0,
                validator.p_participation > 0.95
            ];
            const satisfiedConditions = conditions.filter(cond => cond).length;

            if (satisfiedConditions >= 3) {
                green.push(validator);
            } else if (satisfiedConditions <= 1) {
                red.push(validator);
            } else {
                orange.push(validator);
            }
        });

        const compareByScore = (a, b) => b.total_score - a.total_score;

        green.sort(compareByScore);
        orange.sort(compareByScore);
        red.sort(compareByScore);

        return [...green, ...orange, ...red];
    };

    const drawChart = () => {
        const sortedValidators = classifyAndSortValidators();
        const numScores = sortedValidators.length;
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 40;
        const angleStep = (2 * Math.PI) / numScores;
        const startAngle = -Math.PI / 2;

        const svg = document.getElementById('radialHistogram');
        svg.innerHTML = '';

        sortedValidators.forEach((validator, i) => {
            const angle = startAngle + i * angleStep;
            const lineLength = (validator.total_score / 100) * radius;
            const x = width / 2 + lineLength * Math.cos(angle);
            const y = height / 2 + lineLength * Math.sin(angle);

            let color = '#FFA500';
            const conditions = [
                validator.total_score > average_score,
                validator.missblock === 0,
                validator.jailed_ratio === 0,
                validator.p_participation > 0.95
            ];
            const satisfiedConditions = conditions.filter(cond => cond).length;

            if (satisfiedConditions >= 3) {
                color = '#008000';
            } else if (satisfiedConditions <= 1) {
                color = '#FF0000';
            }

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', width / 2);
            line.setAttribute('y1', height / 2);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
        });
    };

    useEffect(() => {
        if (validatorData.length > 0) {
            drawChart();
        }
        console.log(weight_score_sum, average_score);
    }, [validatorData]);

    return (
        <div className={style.RadHisDiv}>
            <svg id="radialHistogram" width="300" height="300"></svg>
        </div>
    );
}

export default RadialHistogramComponent;
