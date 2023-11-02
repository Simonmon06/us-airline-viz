import React, { useState, useEffect } from 'react';

// month picker
import DateRangePicker from '../commons/DateRangePicker/DateRangePicker';

// route bubble chart
import BubbleChart from "../charts/RouteBubbleChart";

// JSON route data
import RouteDataString from '../../data/route_data.json';
const RouteData= JSON.parse(RouteDataString);

// filter route data by month selection; return topK by total traffic in range. 
const buildAggregateRouteData = (routes, startMonth, endMonth, topK=10) => {
  // routes: JSOn route data
  // startMonth, endMonth: integer/string month values (1-12)
  let filteredRoutes = routes.filter(route => Number(route.Month) >= startMonth && Number(route.Month) <= endMonth);
  let aggregatedRoutes = filteredRoutes.reduce((acc, route) => {
    if (!acc[route.Route]) { acc[route.Route] = [route.TotalTraffic, route.AvgDepDelay * route.TotalTraffic]; }
    acc[route.Route][0] += route.TotalTraffic;
    acc[route.Route][1] += route.AvgDepDelay * route.TotalTraffic;
    return acc
  }, {});
  let sortedAggregatedRoutes = Object.entries(aggregatedRoutes)
    .sort((a, b) => b[1][0] - a[1][0]).slice(0, topK); // Sort in descending order; for ascending, use a[1] - b[1]
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

export const Page2 = () => {

  // ***** Page2 States *******

  // init svg type
  const [selectedSVG, setSelectedSVG] = useState('bubbleChart'); // Initial state for BubbleChart

  // init date range
  const [startMonth, setStartMonth] = useState(2); // init: March
  const [endMonth, setEndMonth] = useState(5); // init: June

  // init chart data
  const [bubbleData, setBubbleData] = useState(buildAggregateRouteData(RouteData, startMonth, endMonth)); 

  // pipe datepicker value change to Page2
  const handleMonthChange = (values) => {
    setStartMonth(values[0]);
    setEndMonth(values[1]);
  };

  // update bubbleData when date range changes
  useEffect(() => { 
    if (selectedSVG === 'bubbleChart') {
      setBubbleData(buildAggregateRouteData(RouteData, startMonth + 1, endMonth + 1));
    }
  }, [selectedSVG, startMonth, endMonth]);

  // Function to change the selected SVG type
  const changeSVG = (svgType) => {
    setSelectedSVG(svgType);
  };

  // ****** Page2 Render *******
  // Render different SVG components based on the selectedSVG state
  let svgComponent;
  if (selectedSVG === 'bubbleChart') {
    // Render BubbleChart component
    svgComponent = <BubbleChart data={bubbleData} attr1Name={"traffic"} attr2Name={'delay'} attr3Name={'route'}/>;
  } else if (selectedSVG === 'otherSVGType') {
    // Render other type of SVG component
    // You can create another SVG component similar to BubbleChart
    // svgComponent = <OtherSVGComponent />;
    console.log('nothing yet.')
  }
  // Add more conditions for other SVG types as needed

  return (
    <div>
      <div>
        <h1>More Charts</h1>
        <DateRangePicker initStart={startMonth} initEnd={endMonth} handleChange={handleMonthChange}></DateRangePicker>

        {/* Add other filters here */}
        <div style={{marginLeft: '40px'}}>
          <button onClick={() => changeSVG('bubbleChart')}>Show Bubble Chart</button>
          <button onClick={() => changeSVG('otherSVGType')}>Show Other SVG</button>
        </div>

        {/* Add buttons for other SVG types */}
      </div>
      <div>
        {svgComponent}
      </div>
    </div>
  );
};