/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
// import RadarChart from "react-svg-radar-chart";
import "react-svg-radar-chart/build/css/index.css";

const RadarChartComponent = ( { valList } ) => {
  const radarChartRef = useRef(null);
  const selectedCircleIds = useSelector((state) => state.circles.selectedCircleIds);
  

  useEffect(() => {
    const filteredValList = (selectedCircleIds && selectedCircleIds.length > 0) ? valList.filter(item => selectedCircleIds.includes(item.val_id)) : [];
    filteredValList.sort((a, b) => selectedCircleIds.indexOf(a.val_id) - selectedCircleIds.indexOf(b.val_id));
    drawRadarChart(filteredValList);
  }, [selectedCircleIds, valList]);

  const drawRadarChart = (data) => {
    const radarChart = radarChartRef.current;
    radarChart.innerHTML = '';

    const margin = { top: 30, right: 40, bottom: 10, left: 120 };
    const width = 140;
    const height = 160;
    const levels = 4;
    
    const maxValue = data.length > 0 ? Math.max(
      ...data.flatMap(d => [d.contribution, d.stability, d.popularity, d.commission])
    ) + 5 || 55 : 50;

    const radius = Math.min(width / 2, height / 2);

    const formatData = data.map(d => ({
        contribution: +d.contribution,
        stability: +d.stability,
        popularity: +d.popularity,
        commission: +d.commission,
        total_score: +d.total_score,
        val_id: d.val_id,
    }));

    const allAxis = ['contribution', 'stability', 'popularity', 'commission'];
    const total = allAxis.length;
    const angleSlice = Math.PI * 2 / total;

    const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, maxValue]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select(radarChart)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0.5);
    
    const radarLine = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice);

    const blobWrapper = svg.selectAll('.radarWrapper')
        .data(formatData)
        .enter().append('g')
        .attr('class', 'radarWrapper');

    blobWrapper.append('path')
        .attr('class', 'radarArea')
        .attr('d', d => radarLine(allAxis.map((axis) => ({ axis, value: d[axis] }))))
        .style('fill', (d, i) => color(i))
        .style('stroke-width', '2px')
        .style('stroke', (d, i) => color(i))
        .style('fill-opacity', 0.2)
        .on('mouseover', function(event, d) {
          d3.select(this).style('fill-opacity', 0.7);
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip.html(`Validator ID: ${d.val_id}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function() {
          d3.select(this).style('fill-opacity', 0.2);
          tooltip.transition().duration(500).style("opacity", 0);
        });

    const axisGrid = svg.append('g').attr('class', 'axisWrapper');

    axisGrid.selectAll('.levels')
        .data(d3.range(1, levels + 1).reverse())
        .enter().append('circle')
        .attr('class', 'gridCircle')
        .attr('r', d => radius / levels * d)
        .style('fill', '#CDCDCD')
        .style('stroke', '#CDCDCD')
        .style('fill-opacity', 0.1);

    const axis = axisGrid.selectAll('.axis')
        .data(['Cont.', 'Stab.', 'Pop.', 'Com.'])
        .enter()
        .append('g')
        .attr('class', 'axis');

    axis.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr('class', 'line')
        .style('stroke', 'none')
        .style('stroke-width', '2px');

    axis.append('text')
        .attr('class', 'legend')
        .style('font-size', '11px')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('x', (d, i) => rScale(maxValue * 1.2) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y', (d, i) => rScale(maxValue * 1.2) * Math.sin(angleSlice * i - Math.PI / 2))
        .text(d => d);

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - margin.left * 2.7}, ${-height / 2})`);

    legend.selectAll("rect")
      .data(formatData)
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", (d, i) => color(i));

    legend.selectAll("text")
      .data(formatData)
      .enter().append("text")
      .attr("x", 20)
      .attr("y", (d, i) => i * 20 + 9)
      .text(d => d.val_id)
      .style("font-size", "11px")
      .attr("text-anchor", "start");
  };

  return (
    <div className="radar-chart-container">
      <div>
          <label>Validator Info</label>
      </div>
      <div ref={radarChartRef}></div>
    </div>
  );
};

export default RadarChartComponent;
