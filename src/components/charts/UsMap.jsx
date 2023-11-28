import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from "topojson-client";

const UsMap = ({topRoutesData, usMapData, uniqueAirportsData}) => {
    const svgMapRef = useRef();
    useEffect(() => {
        const path = d3.geoPath()
    
        const width =975
        const height = 610
        const projection = d3.geoAlbersUsa().scale(1300).translate([width/2, height/2])
    

        let svg = null
        if (topRoutesData && usMapData && uniqueAirportsData && svgMapRef.current) {
            console.log('uniqueAirportsData', uniqueAirportsData)
            svg = d3.select(svgMapRef.current)
                
            svg.selectAll("*").remove();

            svg.attr('width', width ).attr('height', height)

            console.log('svg', svg)
            console.log('usMapData', usMapData)
            console.log('topRoutesData', topRoutesData)
            const stateBackground = svg.append('path')
                .attr('fill', '#ddd')
                .attr('d', path(topojson.feature(usMapData, usMapData.objects.nation)))
        
            const stateBorders = svg.append('path')
                .attr('fill', 'none')
                .attr('stroke', '#fff')
                .attr('stroke-linejoin', 'round')
                .attr('stroke-liinecap', 'round')
                .attr('d', path(topojson.mesh(usMapData, usMapData.objects.states, (a, b)=> a !== b)))
        

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
                
            // const pointsOnMap = svg.selectAll('g')
            //     .data(uniqueAirportsData)
            //     .join('g')
                
            // const airPortGroup = pointsOnMap.append('g')
            // .attr('transform', d => `translate(${projection([d.coords[1], d.coords[0]]).join(',')})`);
            // airPortGroup.append('circle')
            // .attr('r', 2)


            // airportsGroup.append('circle')
            //     .attr('r', 2);
             
            // airportsGroup.append('text')
            //     .attr('y', -6)
            //     .attr('text-anchor', 'middle')
            //     .attr('font-family', 'sans-serif')
            //     .attr('font-size', 10)
            //     .text(d => d.code);

            // -------------------------------------------------------------------------------------------------------
            // the code below draw the duplicate points for all source and dest

            // const pointsOnMap = svg.selectAll('g')
            //     .data(topRoutesData)
            //     .join('g');
            //     // Plotting source points
            // const sourceGroup = pointsOnMap.append('g')
            // .attr('transform', d => `translate(${projection([d.source[1], d.source[0]]).join(',')})`);
            // sourceGroup.append('circle')
            // .attr('r', 2)

            // sourceGroup.append('text')
            //     .attr('y', -6)
            //     .attr('text-anchor', 'middle')
            //     .attr('font-family', 'sans-serif')
            //     .attr('font-size', 10)
            //     .text(d=> d.sourceCode)
      
            // // Plotting destination points
            // const destGroup = pointsOnMap.append('g')
            //     .attr('transform', d => `translate(${projection([d.destination[1], d.destination[0]]).join(',')})`);
        
            // destGroup.append('circle')
            //     .attr('r', 2)
        
            // destGroup.append('text')
            //     .attr('y', -6)
            //     .attr('text-anchor', 'middle')
            //     .attr('font-family', 'sans-serif')
            //     .attr('font-size', 10)
            //     .text(d=> d.destCode)

        }
    }, [topRoutesData])

    return (
        <svg ref={svgMapRef}></svg>
    );
}

export default UsMap