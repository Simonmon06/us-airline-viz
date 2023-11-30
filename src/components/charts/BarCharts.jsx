import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BarCharts = ({dataset}) => {
    console.log('BarCharts', dataset)
    const svgBarChartRef = useRef();
    const [selectedMetric, setSelectedMetric] = useState('TotalTraffic');

    const handleMetricChange = (event) => {
        setSelectedMetric(event.target.value);
    };

    useEffect(() => {


        if (dataset && svgBarChartRef.current) {
            // console.log('drawing!!!!')
            // console.log('svgBarChartRef.current', svgBarChartRef.current)
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
        const formatNumber = d3.format(".0f");

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const monthsInData = Array.from(new Set(dataset.map(d => d.Month)))
                          .sort((a, b) => a - b) // Ensure the months are sorted
                          .map(m => monthNames[m - 1]); // Convert month numbers to names


        const xAccessor = d => d.Month
        const yAccessor = d => d[metric]
    
        const xScale = d3.scaleBand()
          .domain(monthsInData)
          .range([0, dimensions.ctrWidth])
          .padding(0.2);


        const yScale = d3.scaleLinear()
          .domain([0, d3.max(dataset, yAccessor)])
          .range([dimensions.ctrHeight, 0])
          .nice();

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
          .data(dataset)
          .join(
            (enter) => enter.append('rect')
              .attr('width', xScale.bandwidth())
              .attr('height', 0)
              .attr('x', d => xScale(monthNames[d.Month - 1]))
              .attr('y', dimensions.ctrHeight)
              .attr('fill', '#b8de6f'),
            (update) => update,
            // (exit) => exit.attr('fill', '#f39233')
            //   .transition(exitTransition)
            //   .attr('y', dimensions.ctrHeight)
            //   .attr('height', 0)
            //   .remove()
          )
          .transition(updateTransition)
          .attr('width', xScale.bandwidth())
          .attr('height', d => dimensions.ctrHeight - yScale(d[metric]))
          .attr('x', d => xScale(monthNames[d.Month - 1]))
          .attr('y', d => yScale(d[metric]))
          .attr('fill', '#01c5c4')
    
        labelsGroup.selectAll('text')
          .data(dataset)
          .join(
            (enter) => enter.append('text')
              // .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
              .attr("x", d => xScale(monthNames[+d.Month - 1]) + xScale.bandwidth() / 2)
              .attr('y', dimensions.ctrHeight)
              // .attr("y", d => yScale(d[metric]) - 5)
              .attr("text-anchor", "middle") 
              .text(d => formatNumber(d[metric])),
            // (update) => update,
            // (exit) => exit.transition(exitTransition)
            //   .attr('y', dimensions.ctrHeight)
            //   .remove()
          )
          .transition(updateTransition)
          .attr("x", d => xScale(monthNames[+d.Month - 1]) + xScale.bandwidth() / 2)
          .attr("y", d => yScale(d[metric]) - 5)
          .attr("text-anchor", "middle") 
          .text(d => formatNumber(d[metric]))
          // .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
          // .attr('y', d => yScale(yAccessor(d)) - 10)
          // .text(yAccessor)
    
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
            <option value="TotalTraffic">Total Traffic</option>
            <option value='TotalCancel'>Total Cancel</option>
            <option value='TotalDiverted'>Total Diverted</option>
            <option value='AvgActualElapsedTime'>Avg Elapsed Time</option>
            <option value='AvgAirTime'>Avg Air Time</option>
            <option value='AvgCRSElapsedTime'>Avg Elapsed Time</option>
            <option value='AvgDepDelay'>Average Departure Delay</option>
            <option value='AvgTraffic'>Avg Traffic</option>
        </select>
        <svg ref={svgBarChartRef} ></svg>
        </div>
    );
}

export default BarCharts