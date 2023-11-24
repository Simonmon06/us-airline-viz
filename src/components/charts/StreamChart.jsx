import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

// https://d3-graph-gallery.com/graph/streamgraph_template.html

const Int2M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLOR_PALETTE = d3.schemeDark2;

const StreamChart = ({ data, xAttrName, yAttrName, labelAttrName }) => {

    const svgRef = useRef();

    const [isBarplot, setisBarplot] = useState(false);

    useEffect(() => {
        if (data && svgRef.current) {
            const svg = d3.select(svgRef.current);

            const keys = Object.keys(data[0]).slice(1);
            const width = 750;
            const height = 400;
            const leftOffSet = 10;

            const margin = { top: 35, right: 20, bottom: 20, left: 40 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            svg.selectAll("*").remove(); // Clear previous content
            svg.attr("width", innerWidth + margin.left + margin.right)
                .attr("height", innerHeight + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            // switch button
            var buttonContainer = svg.append("foreignObject")
                .attr("width", 150)
                .attr("height", 30)
                .attr("x", 10)
                .attr("y", 10)
                .append("xhtml:body")
                .html(`<button style='width:100%; height:100%;'>${isBarplot ? 'View Streamgraph' : 'View Barplot'}</button>`);

            // Add an event listener to the button
            buttonContainer.select("button")
                .on("click", function () {
                    setisBarplot(!isBarplot);
                });

            if (isBarplot === false) {

                // set the dimensions and margins of the graph
                let [x_min, x_max] = d3.extent(data, function (d) { return d.Month; });

                // Add X axis
                const x = d3.scaleLinear()
                    .domain([x_min, x_max])
                    .range([0, innerWidth]);

                let myTicks = Array.from({ length: x_max - x_min + 1 }, (_, index) => index + x_min);

                svg.append("g")
                    .attr("transform", `translate(${leftOffSet}, ${height * 0.8})`)
                    .call(
                        d3.axisBottom(x).tickSize(-height * .7)
                            .tickValues(myTicks)
                            .tickFormat(x => `${Int2M[x - 1]}`)
                    )
                    .select(".domain")
                    .remove();

                // Customization
                svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

                // Add X axis label:
                svg.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", width)
                    .attr("y", height - 20)
                    .text("Time (month)");

                // Add Y axis
                const y = d3.scaleLinear()
                    .domain([-50000, 50000])
                    .range([height, 0]);

                // color palette
                const color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(COLOR_PALETTE);

                //stack the data?
                const stackedData = d3.stack()
                    .offset(d3.stackOffsetSilhouette)
                    .keys(keys)
                    (data)

                // create a tooltip
                const Tooltip = svg
                    .append("text")
                    .attr("x", margin.left + 100 + leftOffSet)
                    .attr("y", margin.top)
                    .style('font-weight', 'bold')
                    .style("opacity", 0)
                    .style("font-size", 17)

                // Three function that change the tooltip when user hover / move / leave a cell
                const mouseover = function (event, d) {
                    Tooltip.style("opacity", 1);
                    d3.selectAll(".myArea").style("opacity", .2);
                    d3.select(this)
                        .style("stroke", "black")
                        .style("opacity", 1);

                    // console.log(d)
                }

                const mousemove = function (event, d, i) {
                    let grp = d.key
                    Tooltip.text(grp)
                }
                const mouseleave = function (event, d) {
                    Tooltip.style("opacity", 0)
                    d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
                }

                // Area generator
                const area = d3.area()
                    .x(function (d) { return x(d.data.Month); })
                    .y0(function (d) { return y(d[0]); })
                    .y1(function (d) { return y(d[1]); });

                // Show the areas
                svg.selectAll("mylayers")
                    .data(stackedData)
                    .join("path")
                    .attr("class", "myArea")
                    .style("fill", function (d) { return color(d.key); })
                    .attr("d", area)
                    .attr("transform", `translate(${leftOffSet}, 0)`)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave);

            } else {
                // multiseries bar pot
                // Add X axis
                var months = data.map(d => (d.Month));

                var x = d3.scaleBand()
                    .domain(months)
                    .range([0, width])
                    .padding([0.2]);

                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x).tickSize(0));

                // Add Y axis
                var y = d3.scaleLinear()
                    .domain([0, 20000])
                    .range([height, 0]);
                svg.append("g")
                    .call(d3.axisLeft(y));

                // Another scale for subgroup position?
                var xSubgroup = d3.scaleBand()
                    .domain(keys) // Five airline names
                    .range([0, x.bandwidth()])
                    .padding([0.05])

                // color palette = one color per subgroup
                var color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(COLOR_PALETTE);

                // Show the bars
                svg.append("g")
                    .selectAll("g")
                    // Enter in data = loop group per group
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("transform", function (d) { return "translate(" + x(d.Month) + ",0)"; })
                    .selectAll("rect")
                    .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })
                    .enter().append("rect")
                    .attr("x", function (d) { return xSubgroup(d.key); })
                    .attr("y", function (d) { return y(d.value); })
                    .attr("width", xSubgroup.bandwidth())
                    .attr("height", function (d) { return height - y(d.value); })
                    .attr("fill", function (d) { return color(d.key); });

                var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", "translate(" + (width - 500) + ", 0)");

                // Bind the color domain to the legend container
                var legendItems = legend.selectAll(".legend-item")
                    .data(keys)
                    .enter().append("g")
                    .attr("class", "legend-item")
                    .attr("transform", function (d, i) {
                        return "translate(0," + i * 20 + ")";
                    });
                // Append colored squares to represent each series in the legend
                legendItems.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", color);

                // Append text labels for each series in the legend
                legendItems.append("text")
                    .attr("x", 25)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .text(function (d) {
                        return d;
                    });


            } // end if
        }
    }, [data, isBarplot]);
    return (
        <svg ref={svgRef}></svg>
    );
};

export default StreamChart;
