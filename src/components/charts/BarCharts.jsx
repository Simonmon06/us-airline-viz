import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BarCharts = ({dataset}) => {
    const svgBarChartRef = useRef();
    const [selectedMetric, setSelectedMetric] = useState('traffic');

    const handleMetricChange = (event) => {
        setSelectedMetric(event.target.value);
    };

    useEffect(() => {


        if (dataset && svgBarChartRef.current) {
            console.log('drawing!!!!')
            console.log('svgBarChartRef.current', svgBarChartRef.current)
            const svg = d3.select(svgBarChartRef.current);
            svg.selectAll("*").remove();

            // Dimensions
            let dimensions = {
                width: 800,
                height: 400,
                margins: 50
            };
            dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
            dimensions.ctrHeight = dimensions.height - dimensions.margins * 2

            svg.attr("width", dimensions.width)
                .attr("height", dimensions.height)

            const ctr = svg.append("g") // <g>
            .attr(
                "transform",
                `translate(${dimensions.margins}, ${dimensions.margins})`
            )

            histogram(dataset, selectedMetric, dimensions, ctr);

        }
    }, [dataset, selectedMetric])

    function histogram(dataset, metric, dimensions, ctr) {
        console.log(metric)
        console.log(dataset)
        const xAccessor = d => d[metric]
        const yAccessor = d => d.length
    
        // Scales
        const xScale = d3.scaleLinear()
          .domain(d3.extent(dataset, xAccessor))
          .range([0, dimensions.ctrWidth])
          .nice()
    
        const bin = d3.bin()
          .domain(xScale.domain())
          .value(xAccessor)
          .thresholds(10)
    
        const newDataset = bin(dataset)
        const padding = 1
    
        const yScale = d3.scaleLinear()
          .domain([0, d3.max(newDataset, yAccessor)])
          .range([dimensions.ctrHeight, 0])
          .nice()
    
        const exitTransition = d3.transition().duration(500)
        const updateTransition = exitTransition.transition().duration(500)
    

        const labelsGroup = ctr.append('g')
        .classed('bar-labels', true)

        const xAxisGroup = ctr.append('g')
        .style('transform', `translateY(${dimensions.ctrHeight}px)`)

        const meanLine = ctr.append('line')
        .classed('mean-line', true)

        // Draw Bars
        ctr.selectAll('rect')
          .data(newDataset)
          .join(
            (enter) => enter.append('rect')
              .attr('width', d => d3.max([0, xScale(d.x1) - xScale(d.x0) - padding]))
              .attr('height', 0)
              .attr('x', d => xScale(d.x0))
              .attr('y', dimensions.ctrHeight)
              .attr('fill', '#b8de6f'),
            (update) => update,
            (exit) => exit.attr('fill', '#f39233')
              .transition(exitTransition)
              .attr('y', dimensions.ctrHeight)
              .attr('height', 0)
              .remove()
          )
          .transition(updateTransition)
          .attr('width', d => d3.max([0, xScale(d.x1) - xScale(d.x0) - padding]))
          .attr('height', d => dimensions.ctrHeight - yScale(yAccessor(d)))
          .attr('x', d => xScale(d.x0))
          .attr('y', d => yScale(yAccessor(d)))
          .attr('fill', '#01c5c4')
    
        labelsGroup.selectAll('text')
          .data(newDataset)
          .join(
            (enter) => enter.append('text')
              .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
              .attr('y', dimensions.ctrHeight)
              .text(yAccessor),
            (update) => update,
            (exit) => exit.transition(exitTransition)
              .attr('y', dimensions.ctrHeight)
              .remove()
          )
          .transition(updateTransition)
          .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
          .attr('y', d => yScale(yAccessor(d)) - 10)
          .text(yAccessor)
    
        const mean = d3.mean(dataset, xAccessor)
    
        // meanLine.raise()
        //   .transition(updateTransition)
        //   .attr('x1', xScale(mean))
        //   .attr('y1', 0)
        //   .attr('x2', xScale(mean))
        //   .attr('y2', dimensions.ctrHeight)
    
        // Draw Axis
        const xAxis = d3.axisBottom(xScale)
    
        xAxisGroup.transition()
          .call(xAxis)
      }
    
    return (
        <div>
        <select id="metric" onChange={handleMetricChange} value={selectedMetric}>
            <option value="traffic">Traffic</option>
            <option value="delay">Delay</option>
            {/* Add other options here */}
        </select>
        <svg ref={svgBarChartRef} ></svg>
        </div>
    );
}

export default BarCharts