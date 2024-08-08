/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';

const BottomLineChart = () => {
  const [data, setData] = useState([]);
  const [selectedOption, setSelectedOption] = useState('rank');
  const chartRef = useRef(null);

  const inputChain = useSelector((state) => state.chain.inputChain);
  const inputSimilar = useSelector((state) => state.voter.inputSimilar);
  const options = ['rank', 'token', 'asset_value', 'commission', 'jailed'];

  useEffect(() => {
    const sendData = async () => {
      const dataToSend = {
        "chain": inputChain, 
        "similars": inputSimilar, 
        "check": selectedOption
      };
      try {
        const response = await fetch('http://localhost:5002/timeSeriesData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        const parsedData = JSON.parse(responseData).map(d => ({
          ...d,
          record_time: new Date(Number(d.record_time)) // Unix 타임스탬프를 Date 객체로 변환
        }));
        setData(parsedData);
      } catch (error) {
          console.error('There was an error!', error);
      }
    };
    sendData();
  }, [inputChain, inputSimilar, selectedOption]);

  useEffect(() => {
    data.sort((a, b) => inputSimilar.indexOf(a.voter) - inputSimilar.indexOf(b.voter));
    drawLineChart(data);
  }, [data]);

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const drawLineChart = () => {
    const svg = d3.select(chartRef.current);
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 10, bottom: 40, left: 50 },
      width = 440 - margin.left - margin.right,
      height = 180 - margin.top - margin.bottom;

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.record_time))
      .range([0, width]);

    let y;
    if (selectedOption === 'rank') {
      y = d3.scaleLinear()
        .domain([d3.max(data, d => d[selectedOption]), 1])
        .nice()
        .range([height, 0]);
    } else {
      y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[selectedOption])])
        .nice()
        .range([height, 0]);
    }

    const line = d3.line()
      .x(d => x(d.record_time))
      .y(d => y(d[selectedOption]));

    const svgChart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svgChart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svgChart.append("g")
      .call(d3.axisLeft(y));

    const nestedData = d3.group(data, d => d.voter);

    nestedData.forEach((values, key) => {
      values.sort((a, b) => a.record_time - b.record_time);
      svgChart.append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", color(key))
        .attr("stroke-width", 2)
        .attr("d", line);
    });

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "10px")
      .style("pointer-events", "none");

    const bisectDate = d3.bisector(d => d.record_time).left;

    const focus = svgChart.append("g")
      .style("display", "none");

    focus.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", height);

    focus.append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", width)
      .attr("x2", width);

    svgChart.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() {
        focus.style("display", "none");
        tooltip.transition().duration(0).style("opacity", 0);
      })
      .on("mousemove", function(event) {
        const mouseX = d3.pointer(event, this)[0];
        const x0 = x.invert(mouseX);
        const dataAtX = Array.from(nestedData).map(([, values]) => {
          const i = bisectDate(values, x0, 1);
          const d0 = values[i - 1];
          const d1 = values[i];
          return x0 - d0.record_time > d1.record_time - x0 ? d1 : d0;
        });

        const mouseY = d3.pointer(event, this)[1];
        focus.select(".x-hover-line")
          .attr("transform", `translate(${mouseX},${y(d3.max(dataAtX, d => d[selectedOption])) - mouseY})`);
        focus.select(".y-hover-line")
          .attr("transform", `translate(${mouseX},${mouseY - height})`);

        tooltip.transition().duration(0).style("opacity", .9);
        tooltip.html(formatTooltip(dataAtX))
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      });

    function formatTooltip(dataAtX) {
      const date = dataAtX[0].record_time;
      let tooltipHtml = `<strong>${date.toLocaleDateString()}</strong><br/>`;
      dataAtX.forEach(d => {
        const colorBox = `<span style="background:${color(d.voter)}; width:10px; height:10px; display:inline-block; margin-right:5px;"></span>`;
        tooltipHtml += `${colorBox}${d.voter}: ${d[selectedOption]}<br/>`;
      });
      return tooltipHtml;
    }
  };

  return (
    <div className="history-in">
      <div>
          <label>History</label>
      </div>
      <div className="history-container">
        <div className="radio-buttons">
          {options.map(option => (
            <label key={option} className="radio-label">
              <input
                type="radio"
                value={option}
                checked={selectedOption === option}
                onChange={handleRadioChange}
                className="radio-input"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        <div className="line-chart-container">
          <svg ref={chartRef} width="530" height="180"></svg>
        </div>
      </div>
    </div>
  );
};

export default BottomLineChart;
