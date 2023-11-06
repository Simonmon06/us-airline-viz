import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// https://d3-graph-gallery.com/graph/streamgraph_template.html


// Data Format:
// year,Amanda,Ashley,Betty,Deborah,Dorothy,Helen,Linda,Patricia
// 1880,241,0,117,12,112,636,27,0
// 1881,263,0,112,14,109,612,38,0
// 1882,288,0,123,15,115,838,36,0
// 1883,287,0,120,16,141,862,49,0

const StreamChart = ({ data, attr1Name, attr2Name, attr3Name}) => {

  const svgRef = useRef();

  useEffect(() => {

    if (data && svgRef.current) {

      const svg = d3.select(svgRef.current);

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 30, bottom: 0, left: 10},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    svg.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data

    // List of groups = header of the csv files
    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height*0.8 + ")")
        .call(d3.axisBottom(x).tickSize(-height*.7).tickValues([1900, 1925, 1975, 2000]))
        .select(".domain").remove()
    // Customization
    svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height-30 )
        .text("Time (year)");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-100000, 100000])
        .range([ height, 0 ]);

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeDark2);

    //stack the data?
    var stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (data)

    // create a tooltip
    var Tooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 17)

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    var mousemove = function(d,i) {
        grp = keys[i]
        Tooltip.text(grp)
    }
    var mouseleave = function(d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    }

    // Area generator
    var area = d3.area()
        .x(function(d) { return x(d.data.year); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

    // Show the areas
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    }
  }, [data]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default StreamChart;
