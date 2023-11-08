import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// https://d3-graph-gallery.com/graph/streamgraph_template.html


// Data Format:
// year,Amanda,Ashley,Betty,Deborah,Dorothy,Helen,Linda,Patricia
// 1880,241,0,117,12,112,636,27,0
// 1881,263,0,112,14,109,612,38,0
// 1882,288,0,123,15,115,838,36,0
// 1883,287,0,120,16,141,862,49,0

const StreamChart = ({ data, xAttrName, yAttrName, labelAttrName}) => {

  const svgRef = useRef();

  useEffect(() => {
    if (data && svgRef.current) {
      const svg = d3.select(svgRef.current);

      const keys = Object.keys(data[0]).slice(1);
      const width = 600;
      const height = 400;
      const leftOffSet = 50;

      const margin = { top: 20, right: 20, bottom: 20, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      svg.selectAll("*").remove(); // Clear previous content

      svg.attr("width", innerWidth + margin.left + margin.right)
          .attr("height", innerHeight + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

        // set the dimensions and margins of the graph
        let [x_min, x_max] = d3.extent(data, function(d) { return d.Month; });

        // Add X axis
        const x = d3.scaleLinear()
                    .domain([ x_min, x_max ])
                    .range([ 0, innerWidth ]);

        let myTicks = Array.from({ length: x_max - x_min + 1 }, (_, index) => index + x_min);
        svg.append("g")
            .attr("transform", `translate(${leftOffSet}, ${height*0.8})`)
            .call(d3.axisBottom(x).tickSize(-height*.7).tickValues(myTicks))
            .select(".domain")
            .remove();

        // Customization
        svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height - 20 )
            .text("Time (month)");

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([-50000, 50000])
            .range([ height, 0 ]);
        // svg.append("g")
        //     .attr("transform", `translate(${leftOffSet}, 0)`)
        //     .call(d3.axisLeft(y));

        // color palette
        const color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeDark2);

        //stack the data?
        const stackedData = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(keys)
            (data)

        // create a tooltip
        const Tooltip = svg
            .append("text")
            .attr("x", margin.left + leftOffSet)
            .attr("y", margin.top)
            .style("opacity", 0)
            .style("font-size", 17)

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function(event,d) {
            Tooltip.style("opacity", 1)
            d3.selectAll(".myArea").style("opacity", .2)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        const mousemove = function(event,d,i) {
            let grp = d.key
            Tooltip.text(grp)
        }
        const mouseleave = function(event,d) {
            Tooltip.style("opacity", 0)
            d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
        }

        // Area generator
        const area = d3.area()
            .x(function(d) { return x(d.data.Month); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); });

        // Show the areas
        svg.selectAll("mylayers")
            .data(stackedData)
            .join("path")
            .attr("class", "myArea")
            .style("fill", function(d) { return color(d.key); })
            .attr("d", area)
            .attr("transform", `translate(${leftOffSet}, 0)`)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    }
  }, [data]);
  return (
    <svg ref={svgRef}></svg>
  );
};

export default StreamChart;
