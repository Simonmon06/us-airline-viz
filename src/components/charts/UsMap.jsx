import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from "topojson-client";

const UsMap = ({topRoutesData, usMapData, uniqueAirportsData, selectedRoute, changeSelectedRoute}) => {
    const svgMapRef = useRef();
    useEffect(() => {

        function linkArc(d) {
            const source = projection(d.source);
            const target = projection(d.destination);
            
            if (!source || !target) return ''; // Check if the projection is valid for both points
            
            const dx = target[0] - source[0],
                  dy = target[1] - source[1],
                  distance = Math.sqrt(dx * dx + dy * dy) 

            const curvatureBase = 0.3;

            let curvature = curvatureBase * (1000 / distance);

            const sweep = (d.sourceCode < d.destCode) ? 0 : 1;
            
            // Calculate the arc's radius adjusted by the curvature
            const dr = Math.max(distance, distance * curvature);

            return `M${source[0]},${source[1]}A${dr},${dr} 0 0,${sweep} ${target[0]},${target[1]}`;
        }

        // arc hightlighting
        const setHighlightArc = (selector) => {
            selector.attr('stroke-opacity', 1).style("filter", "url(#glow)");
        }
        const setNormalArc = (selector) => {
            selector.attr('stroke-opacity', 0.6).style("filter", "none");
        }

        const paintSavedArcSelection = () => {
            if (selectedRoute !== "") {
                setHighlightArc(d3.selectAll('path.route').filter(d => d.route === selectedRoute));
                setNormalArc(d3.selectAll('path.route').filter(d => d.route !== selectedRoute));
            } else {
                setNormalArc(d3.selectAll('path.route'));
            }
        }
 
        const path = d3.geoPath()
    
        const width =975
        const height = 610
        const projection = d3.geoAlbersUsa().scale(1300).translate([width/2, height/2])

        let svg = null
        if (topRoutesData && usMapData && uniqueAirportsData && svgMapRef.current) {

            const maxTraffic = Math.max(...topRoutesData.map(d => d.traffic));
            const minTraffic = Math.min(...topRoutesData.map(d => d.traffic));

            const trafficScale = d3.scalePow()
                .exponent(2) // Squaring the input to amplify differences
                .domain([minTraffic, maxTraffic])
                .range([2, 10]) // Adjust the range to get the desired visual effect
                .clamp(true); 

            // console.log('uniqueAirportsData', uniqueAirportsData)
            svg = d3.select(svgMapRef.current)
            svg.selectAll("*").remove();

            const defs = svg.append("defs");

            // Create the filter with feGaussianBlur and feMerge
            const filter = defs.append("filter")
            .attr("id", "glow");

            filter.append("feGaussianBlur")
            .attr("stdDeviation", 5)
            .attr("result", "coloredBlur");

            const feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "coloredBlur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");

            svg.attr('width', width ).attr('height', height)

            // console.log('svg', svg)
            // console.log('usMapData', usMapData)
            // console.log('topRoutesData', topRoutesData)
            const stateBackground = svg.append('path')
                .attr('fill', '#ddd')
                .attr('class', 'backgroundmap')
                .attr('d', path(topojson.feature(usMapData, usMapData.objects.nation)))
        
            const stateBorders = svg.append('path')
                .attr('fill', 'none')
                .attr('stroke', '#fff')
                .attr('stroke-linejoin', 'round')
                .attr('stroke-liinecap', 'round')
                .attr('d', path(topojson.mesh(usMapData, usMapData.objects.states, (a, b)=> a !== b)))
        
            
            // Draw the routes as arcs
            const routesGroup = svg.append('g').attr('class', 'routes');

            const mouseover = (e, d, i) => {
                setNormalArc(d3.selectAll('path.route'));
                setHighlightArc(d3.select(e.target)); 
            }

            const mouseleave = (e, d, i) => {
                paintSavedArcSelection();
            }

            const mouseclick = (e, d, i) => { 
                changeSelectedRoute(d.route);
            }

            routesGroup.selectAll('path.route')
                .data(topRoutesData)
                .enter().append('path')
                .attr('class', 'route')
                .attr('d', (d) => linkArc({
                    route: d.route,
                    source: [d.source[1], d.source[0]],
                    destination: [d.destination[1], d.destination[0]] 
                },
                )) 
                .attr('fill', 'none')
                .attr('stroke', (d) =>(d.sourceCode < d.destCode) ? 'orange' : 'red') // Alternate colors for the paths
                .attr('stroke-width', d => trafficScale(d.traffic))
                .attr('stroke-opacity', 0.6)
                .on('mouseover', mouseover)
                .on('mouseleave', mouseleave)
                .on('click', mouseclick); 

            const airportsGroup = svg.selectAll('g.airport') // Ensure you select the correct existing groups
                .data(uniqueAirportsData)
                .join('g')
                .attr('class', 'airport') // Set the class attribute for new groups
                .attr('transform', d => `translate(${projection([d.coords[1], d.coords[0]]).join(',')})`)

                airportsGroup.append('circle')
                    .attr('r', 2)
                    .attr('fill', 'black')

                airportsGroup.append('text')
                    .attr('y', d => d.code === 'MIA' ? 12 : -6)
                    .attr('text-anchor', 'middle')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', 10)
                    .text(d => d.code);

            svg.selectAll('.backgroundmap')
            .on('click', (e, d) => {
                changeSelectedRoute("");
            })
            
            paintSavedArcSelection();
 
        }
    }, [topRoutesData])

    return (
        <svg ref={svgMapRef}></svg>
    );
}

export default UsMap