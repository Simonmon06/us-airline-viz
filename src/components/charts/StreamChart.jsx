import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

import { Constants } from "../commons/utils";

// https://d3-graph-gallery.com/graph/streamgraph_template.html

const Int2M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLOR_PALETTE = d3.schemeDark2;

const StreamChart = ({ data, xAttrName, yAttrName, labelAttrName }) => {

    const svgRef = useRef();

    const [isBarplot, setisBarplot] = useState(false);

    useEffect(() => {
        if (data && svgRef.current) {
            let svg = d3.select(svgRef.current);
            svg.selectAll("*").remove(); // Clear previous content

            // keys: ['Airline', 'TotalTraffic', 'DomesticTraffic', 'InternationalTraffic']
            const keys = Object.keys(data[0]).slice(1);

            // svg size
            const width = Constants.svgWidth;
            const height = Constants.svgHeight;
            const margin = { top: 10, right: 20, bottom: 20, left: 20 };
            const leftOffSet = 10; // show complete tick label for streamgraph

            // svg inner size
            let innerWidth = width - margin.left - margin.right;
            let innerHeight = height - margin.top - margin.bottom;

            // refresh svg, re-create
            svg = svg.attr("width", innerWidth + margin.left + margin.right)
                .attr("height", innerHeight + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // sub-type switch button
            const buttonContainer = svg.append("foreignObject")
                .attr("width", 150)
                .attr("height", 30)
                .attr("x", 10)
                .attr("y", 10)
                .append("xhtml:body")
                .html(`<button style='width:100%; height:100%;'>${isBarplot ? 'View Streamgraph' : 'View Barplot'}</button>`);
            buttonContainer.select("button")
                .on("click", function () { setisBarplot(!isBarplot); });

            // create chart 
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
                svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

                // Add X axis label:
                svg.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", width - innerWidth / 2)
                    .attr("y", height - 20)
                    .text("Time (month)");

                // Add Y axis
                const y = d3.scaleLinear()
                    .domain([-40000, 35000])
                    .range([height, 0]);

                // color palette
                const color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(COLOR_PALETTE);

                //stack the data?
                let stackedData = d3.stack()
                    .offset(d3.stackOffsetSilhouette)
                    .keys(keys)
                    (data)

                svg.append('text').text('click to record')
                    .attr('x', innerWidth - 100).attr('y', 20)
                    .style('fill', 'orange')
                    .style('font-style', 'italic');

                // Draw streams!
                let area = d3.area()
                    .x(function (d) { return x(d.data.Month); })
                    .y0(function (d) { return y(d[0]); })
                    .y1(function (d) { return y(d[1]); });

                let myAreas = svg.selectAll("mylayers")
                    .data(stackedData)
                    .join("path")
                    .attr("class", "myArea")
                    .style("fill", function (d) { return color(d.key); });

                myAreas
                    .attr("d", area)
                    .attr("transform", `translate(${leftOffSet}, 0)`);

                // *********** INTERACTIONS **************
                let fixed_table = null;
                function updateTable(d) {
                    const Descrption = d3.select('#stat-description-div').html('');
                    let tmp = "";
                    if (d) {
                        let tableData = d.map((x) => { return [Int2M[x.data.Month - 1], x.data[d.key]] });
                        let _table = tableData.reduce((acc, item) =>
                            acc + `<tr><td>${item[0]}</td><td>${item[1]}</td></tr>`, "");
                        _table = `<table><tr><th>Month</th><th>Traffic</th></tr>${_table}</table>`;
                        tmp = `<div style="font-weight: bold;">Airline: ${d.key}</div>
                            <br><div>${_table}</div>`;
                    }
                    Descrption.html(tmp);
                }
                // --> Lazy Tooltip
                let InfoTip = svg
                    .append("text")
                    .style("opacity", 0)
                    .text('recorded!')
                    .style('fill', 'red')
                    .style("font-size", 15);

                // --> Mouse Actions 
                const mouseover = function (event, d) {
                    d3.selectAll(".myArea").style("opacity", .2);
                    d3.select(this)
                        .style("stroke", "black")
                        .style("opacity", 1);
                }
                const mousemove = function (event, d, i) { updateTable(d); }
                const mouseleave = function (event, d) {
                    d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
                    updateTable(fixed_table);
                }

                const mouselick = function (event, d) {
                    fixed_table = d;
                    updateTable(fixed_table);
                    // show temp tooltip
                    InfoTip
                        .style('opacity', 1)
                        .attr("x", (d3.pointer(event)[0] + 15) + "px")
                        .attr("y", (d3.pointer(event)[1] - 5) + "px")
                        .transition()
                        .duration(1500).style("opacity", 0);
                }

                myAreas.on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
                    .on("click", mouselick);

            } else {
                // multiseries bar pot
                // Add X axis
                let months = data.map(d => (Int2M[d.Month - 1]));

                const x = d3.scaleBand()
                    .domain(months)
                    .range([0, innerWidth])
                    .padding([0.2]);

                svg.append("g")
                    .attr("transform", "translate(0," + innerHeight + ")")
                    .call(d3.axisBottom(x).tickSize(0));

                // Add Y axis
                const y = d3.scaleLinear()
                    .domain([0, 20000])
                    .range([innerHeight, 0]);

                svg.append("g")
                    .attr("transform", "translate(" + 0.5 * leftOffSet + ", 0)")
                    .call(d3.axisLeft(y).tickFormat((d, i) => { return d / 1000 + "k" }));

                // Another scale for subgroup position?
                var xSubgroup = d3.scaleBand()
                    .domain(keys) // Five airline names
                    .range([0, x.bandwidth()])
                    .padding([0.05])

                // color palette = one color per subgroup
                var color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(COLOR_PALETTE);

                const myBars =
                    svg.append("g")
                        .selectAll("g")
                        // Enter in data = loop group per group
                        .data(data)
                        .enter()
                        .append("g")
                        .attr("transform", function (d) { return "translate(" + x(Int2M[d.Month - 1]) + ",0)"; })
                        .selectAll("rect")
                        .data(function (d) {
                            return keys.map(function (key) {
                                return {
                                    key: key, value: d[key],
                                    month: Int2M[d.Month - 1]
                                };
                            });
                        })
                        .enter().append("rect")
                        .attr("class", "bar-item")
                        .attr("x", function (d) { return xSubgroup(d.key); })
                        .attr("y", function (d) { return y(d.value); })
                        .attr("width", xSubgroup.bandwidth())
                        .attr("height", function (d) { return innerHeight - y(d.value); })
                        .attr("fill", function (d) { return color(d.key); });

                // ************ legend bars
                var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", "translate(" + (width - 250) + ", 0)");

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

                const mouseover = (event, d, i) => {
                    let others = svg.selectAll("rect.bar-item").filter((item) => { return item.key !== d.key });
                    let same = Array.from(svg.selectAll("rect.bar-item").filter((item) => { return item.key === d.key }));
                    let otherLegends = svg.selectAll('.legend-item > rect').filter(x => x !== d.key);

                    // update UI
                    others.style("opacity", .2);
                    otherLegends.style("opacity", .2);

                    // update state
                    let tableData = same.map((x) => { return [x.__data__.month, x.__data__.value] });
                    let _table = tableData.reduce((acc, item) =>
                        acc + `<tr><td>${item[0]}</td><td>${item[1]}</td></tr>`, "");
                    _table = `<table><tr><th>Month</th><th>Traffic</th></tr>${_table}</table>`;
                    _table = `<div style="font-weight: bold;">Airline: ${d.key}</div>
                        <br><div>${_table}</div>`;
                    const Descrption = d3.select('#stat-description-div').html('');
                    Descrption.html(`<div>${_table}</div>`);
                }

                const mouseleave = (event, d, i) => {
                    svg.selectAll("rect").style("opacity", 1);
                }

                // add mouse events 
                myBars.on('mouseover', mouseover)
                    .on('mouseleave', mouseleave);


            } // end if

            // add title
            svg.append('text')
                .attr('x', innerWidth / 2 - 50)
                .attr('y', 10)
                .attr('fill', 'black')
                .attr('font-size', '20px')
                .attr('font-weight', 'bold')
                .text(`Airline Traffic`);
        }

    }, [data, isBarplot]);
    return (
        <svg ref={svgRef}></svg>
    );
};

export default StreamChart;
