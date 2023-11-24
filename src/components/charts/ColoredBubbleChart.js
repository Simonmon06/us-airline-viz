import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Colored Bubble Chart
//   Produce a svg with bubbles randomly placed on the screen with radius and color defined by data

// Data format:
//  data = [item] 
//  item = {attr1Name: Number, size of bubble, attri2Name: Number, color scale, attr3Name: String, label text}
//  Might need to adjust radiusScale.range to fit all bubbles in box boundaries
//  10 or less bubbles will produce the best visual effect

const BubbleChart = ({ data, attr1Name, attr2Name, attr3Name}) => {
  const svgRef = useRef();
  useEffect(() => {
    if (data && svgRef.current) {
      const svg = d3.select(svgRef.current);

      const width = 800;
      const height = 600;
      const legendWidth = 20;

      const margin = { top: 35, right: 20, bottom: 20, left: 40 };
      const innerWidth = width - margin.left - margin.right - legendWidth;
      const innerHeight = height - margin.top - margin.bottom;

      const numberFormat = d3.format('.1f');

      // attribute 1 defines radius scale
      const radiusScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[attr1Name])])
      .range([5, innerWidth / 14]);
      
      // attribute 2 defines color scale
      const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, d3.max(data, d => d[attr2Name])]);

      svg.selectAll("*").remove(); // Clear previous content

      svg.attr('width', width)
        .attr('height', height);

      const simulationData = data.map(d => ({
          ...d,
          x: Math.random() * innerWidth,
          y: Math.random() * innerHeight
        }));

      const simulation = d3.forceSimulation(simulationData)
        .force('x', d3.forceX(innerWidth / 2).strength(0.05))
        .force('y', d3.forceY(innerHeight / 2).strength(0.05))
        .force('collide', d3.forceCollide().radius(d => radiusScale(d[attr1Name]) * 1.5).strength(1).iterations(1))
        // .force('collide', d3.forceCollide().radius(d => Math.sqrt(d.attribute1) * 1.5).strength(1).iterations(1))
        .stop();

      for (let i = 0; i < 300; ++i) simulation.tick();
      
      // add legend
      const legendGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y2", "0%")
        .attr("y1", "100%");

      for (let i = 0; i <= 10; i++) {
        legendGradient.append("stop")
          .attr("offset", i * 10 + "%")
          .attr("stop-color", colorScale(i))
          .attr("stop-opacity", 1);
      }

      // add legend
      const legend = svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", 20)
        .attr("height", innerHeight)
        .style("fill", "url(#legendGradient)");

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left + legendWidth},${margin.top})`);

      g.append('rect')
        .attr('width', innerWidth - legendWidth)
        .attr('height', innerHeight)
        .style('fill', 'none')
        .style('stroke', 'black');

      g.selectAll("circle")
        .data(simulationData)
        .enter()
        .append("circle")
        .attr('cx', innerWidth / 2)
        .attr("cy", innerHeight / 2)
        .transition()
        .duration(300)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => radiusScale (d[attr1Name]))
        .attr("fill", d => colorScale(d[attr2Name]))
        ;

      g.selectAll("text")
        .data(simulationData)
        .enter().append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr('fill', 'white')
        .text(d => d[attr3Name]);

    g.append('text')
        .attr('x', -legendWidth - 10)
        .attr('y', -2)
        .attr('fill', 'black')
        .text(`${numberFormat(d3.max(data, d => d[attr2Name]))}`);

      g.append('text')
        .attr('x', -legendWidth - 10)
        .attr('y', innerHeight + 15)
        .attr('fill', 'black')
        .text(`${numberFormat(d3.min(data, d => d[attr2Name]))}`);

    // add title
    g.append('text')
        .attr('x', innerWidth / 2 - 100) 
        .attr('y', -10)
        .attr('fill', 'black')
        .text(`Top 10 Route Traffic`);

    g.append('text')
        .attr('x', -legendWidth - 10)
        .attr('y', -20)
        .attr('fill', 'black')
        .text(`Delay (Minutes)`);
    }
  }, [data]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default BubbleChart;
