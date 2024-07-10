/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { useDispatch, useSelector } from 'react-redux';
import { toggleCircleId } from '../store';
import { useSprings, animated } from '@react-spring/web';
import TooltipContent from './tooltip';
import '../styles/center.css';

function Center({ cooldinateData, data, weightList, recommendData }){
    const [circles, setCircles] = useState(cooldinateData || []);
    const [tooltipContent, setTooltipContent] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
    const [interestedCool, setInterestedCool] = useState(recommendData['interested'] || []);
    const [recVal, setRecVal] = useState(recommendData['sim_id'] || []);
    const dispatch = useDispatch();
    const selectedCircleIds = useSelector((state) => state.circles.selectedCircleIds);

    const handleMouseOver = (circle, event) => {
        const val = data.filter(item => item.val_id === circle.val_id)[0];
        if (!val) return;
        const tooltipJSX = (
            <TooltipContent circle={circle} val={val} weightList={weightList} />
        );
        setTooltipContent(tooltipJSX);
        setShowTooltip(true);
    };

    const handleCircleClick = (circle) => {
        dispatch(toggleCircleId(circle.val_id));
    };

    const getGradientColors = (circle) => {
        switch (circle.kmeanscluster) {
            case 0:
                return { start: "#EDBBF5", end: "#B8B8F0" };
            case 1:
                return { start: "#3DF2C6", end: "#94DE81" };
            case 2:
                return { start: "#FFC56F", end: "#FF906D" };
            default:
                return { start: "#EDBBF5", end: "#B8B8F0" };
        }
    };

    const getFillColor = (circle) => {
        return `url(#gradient-${circle.val_id})`;
    };

    const getFillOpacity = (circle) => {
        return selectedCircleIds.includes(circle.val_id) ? 1.5 : 0.8;
    };

    const getStroke = (circle) => {
        return  Array.isArray(recVal[0]) ? (selectedCircleIds.includes(circle.val_id)&&recVal[0].includes(circle.val_id) ? 'black' : recVal[0].includes(circle.val_id) ? 'red' : selectedCircleIds.includes(circle.val_id) ? 'black' : 'none') : selectedCircleIds.includes(circle.val_id) ? 'black' : 'none';
    };

    const getStrokeWidth = (circle) => {
        return Array.isArray(recVal[0]) ? (selectedCircleIds.includes(circle.val_id)&&recVal[0].includes(circle.val_id) ? 0.5 : recVal[0].includes(circle.val_id) ? 0.3 : selectedCircleIds.includes(circle.val_id) ? 0.1 : 0) : selectedCircleIds.includes(circle.val_id) ? 0.1 : 0;
    }

    const adjustPositions = (circles) => {
        const padding = 2; // Add some padding to avoid touching edges
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                const circle1 = circles[i];
                const circle2 = circles[j];
                const dx = circle1.ftr1 - circle2.ftr1;
                const dy = circle1.ftr2 - circle2.ftr2;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = circle1.score / 45 + circle2.score / 45 + padding;
                if (distance < minDistance) {
                    const angle = Math.atan2(dy, dx);
                    const moveDistance = (minDistance - distance) / 5;
                    const moveX = Math.cos(angle) * moveDistance;
                    const moveY = Math.sin(angle) * moveDistance;
                    circle1.ftr1 += moveX;
                    circle1.ftr2 += moveY;
                    circle2.ftr1 -= moveX;
                    circle2.ftr2 -= moveY;
                }
            }
        }
    };

    const minX = Math.min(...circles.map(c => c.ftr1));
    const maxX = Math.max(...circles.map(c => c.ftr1));
    const minY = Math.min(...circles.map(c => -c.ftr2));
    const maxY = Math.max(...circles.map(c => -c.ftr2));
    const padding = 5;

    const viewBox = `${minX - padding} ${minY - padding} ${maxX - minX + 2 * padding} ${maxY - minY + 2 * padding}`;

    const minScore = Math.min(...circles.map(c => c.score));
    const maxScore = Math.max(...circles.map(c => c.score));

    const calculateRadius = (score) => {
        const minRadius = 0.1;
        const maxRadius = 1.2;
        return minRadius + (score - minScore) / (maxScore - minScore) * (maxRadius - minRadius);
    };

    useEffect(() => {
        if(recommendData){
            setInterestedCool(recommendData['interested'] || []);
            setRecVal(recommendData['sim_id'] || []);
        } 

        if (cooldinateData) {
            setCircles(cooldinateData);
            adjustPositions(cooldinateData);
        }
    }, [cooldinateData, recommendData]);

    const springs = useSprings(
        circles.length,
        circles.map(circle => ({
            cx: circle.ftr1,
            cy: -circle.ftr2,
            config: { tension: 170, friction: 26 }
        }))
    );

    return (
        <div>
            <svg width="890" height="500" viewBox={viewBox} className="svg">
                <defs>
                    {circles.map(circle => {
                        const { start, end } = getGradientColors(circle);
                        return (
                            <linearGradient id={`gradient-${circle.val_id}`} x1="0%" y1="0%" x2="100%" y2="100%" key={circle.val_id}>
                                <stop offset="0%" style={{ stopColor: start, stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: end, stopOpacity: 1 }} />
                            </linearGradient>
                        );
                    })}
                    {interestedCool.map(circle => {
                        const { start, end } = getGradientColors(circle);
                        return (
                            <linearGradient id={`gradient-${circle.val_id}`} x1="0%" y1="0%" x2="100%" y2="100%" key={`interested-${circle.val_id}`}>
                                <stop offset="0%" style={{ stopColor: start, stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: end, stopOpacity: 1 }} />
                            </linearGradient>
                        );
                    })}
                </defs>
                {springs.map((animatedProps, index) => (
                    <animated.circle 
                        id="my-anchor-element"
                        key={circles[index].val_id}
                        cx={animatedProps.cx}
                        cy={animatedProps.cy}
                        r={calculateRadius(circles[index].score)}
                        fill={getFillColor(circles[index])}
                        fillOpacity={getFillOpacity(circles[index])}
                        stroke={getStroke(circles[index])}
                        strokeWidth={getStrokeWidth(circles[index])}
                        onMouseOver={() => handleMouseOver(circles[index])}
                        onClick={() => handleCircleClick(circles[index])}
                    />
                ))}
                {interestedCool.map((circle, index) => (
                    <circle
                        key={`new-circle-${index}`}
                        cx={circle.ftr1}
                        cy={-circle.ftr2}
                        r={calculateRadius(circle.score)}
                        fill={getFillColor(circle)}
                        fillOpacity={getFillOpacity(circle)}
                        stroke="blue"
                        strokeWidth={0.3}
                        onMouseOver={() => handleMouseOver(circle)}
                        onClick={() => handleCircleClick(circle)}
                    />
                ))}
            </svg>
            {showTooltip && (
            <Tooltip
                anchorSelect="#my-anchor-element"
                content={tooltipContent}
                visible={showTooltip} 
                direction="right"
                className="custom-tooltip"
                 >{tooltipContent}</Tooltip>
            )}
        </div>
    );
}

export default Center;
