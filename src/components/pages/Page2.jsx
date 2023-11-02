import React, { useState } from 'react';

import BubbleChart from "../charts/RouteBubbleChart";
// import DateRangePicker from '../commons/DateRangePicker/DateRangePicker';

import RouteData from '../../data/route_data.json';

const routes = JSON.parse(RouteData);

const buildAggregateRouteData = (routes, startMonth, endMonth) => {
  let filteredRoutes = routes.filter(route => Number(route.Month) >= startMonth && Number(route.Month) <= endMonth);
  let aggregatedRoutes = filteredRoutes.reduce((acc, route) => {
    if (!acc[route.Route]) { acc[route.Route] = [route.TotalTraffic, route.AvgDepDelay * route.TotalTraffic]; }
    acc[route.Route][0] += route.TotalTraffic;
    acc[route.Route][1] += route.AvgDepDelay * route.TotalTraffic;
    return acc
  }, {});
  let sortedAggregatedRoutes = Object.entries(aggregatedRoutes)
    .sort((a, b) => b[1][0] - a[1][0]).slice(0, 10); // Sort in descending order; for ascending, use a[1] - b[1]

  let answer = [];
  for (let i=0; i<sortedAggregatedRoutes.length; i++) {
    let route = sortedAggregatedRoutes[i];
    answer.push({
      route: route[0],
      traffic: route[1][0],
      delay: route[1][1] / route[1][0]
    })
  }
  return answer
}

const bubbleData = buildAggregateRouteData(routes, 1, 3);

// Import other SVG components or define them in this file

export const Page2 = () => {
  const [selectedSVG, setSelectedSVG] = useState('bubbleChart'); // Initial state for BubbleChart

  // Function to change the selected SVG type
  const changeSVG = (svgType) => {
    setSelectedSVG(svgType);
  };

  // Render different SVG components based on the selectedSVG state
  let svgComponent;
  if (selectedSVG === 'bubbleChart') {
    // Render BubbleChart component
    svgComponent = <BubbleChart data={bubbleData} attr1Name={"traffic"} attr2Name={'delay'} attr3Name={'route'}/>;
  } else if (selectedSVG === 'otherSVGType') {
    // Render other type of SVG component
    // You can create another SVG component similar to BubbleChart
    // and import it here.
    // svgComponent = <OtherSVGComponent />;
    console.log('nothing yet.')
  }
  // Add more conditions for other SVG types as needed

  return (
    <div>
      <div>
      <h1>More Charts</h1>
        {/* <DateRangePicker></DateRangePicker> */}
        <button onClick={() => changeSVG('bubbleChart')}>Show Bubble Chart</button>
        <button onClick={() => changeSVG('otherSVGType')}>Show Other SVG</button>
        {/* Add buttons for other SVG types */}
      </div>
      <div>
        {svgComponent}
      </div>
    </div>
  );
};