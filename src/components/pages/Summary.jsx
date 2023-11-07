import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';

// *********  Utilities  *********
import DateRangePicker from '../commons/DateRangePicker/DateRangePicker';
import { chartDataAggregator} from '../commons/utils';

// *********  Charts  *********
import BubbleChart from "../charts/ColoredBubbleChart";
import StreamChart from '../charts/StreamChart';

// *********  Data  *********
import RouteDataString from '../../data/route_data.json';
import AirlineDataString from '../../data/airline_data.json';

// *******  Page2  ********
const AirlineData = JSON.parse(AirlineDataString); // [{}]
const RouteData = JSON.parse(RouteDataString); // [{}]

// console.log(chartDataAggregator.getAirlineData(AirlineData, 1, 6));
// console.log(chartDataAggregator.prepareAirlineStreamGraph(AirlineData, 1, 12, "TotalTraffic"));
export const Summary = () => {

  // ***** Page2 States *******

  // init svg type
  const [selectedSVG, setSelectedSVG] = useState('bubbleChart'); // Initial state for BubbleChart

  // init date range
  const [startMonth, setStartMonth] = useState(2); // init: March
  const [endMonth, setEndMonth] = useState(5); // init: June

  // init chart data
  const [bubbleData, setBubbleData] = useState(chartDataAggregator.getRouteData(RouteData, startMonth, endMonth)); 
  const [streamData, setStreamData] = useState(chartDataAggregator.prepareAirlineStreamGraph(AirlineData, startMonth, endMonth, "TotalTraffic"));

  // pipe datepicker value change to Page2
  const handleMonthChange = (values) => {
    setStartMonth(values[0]);
    setEndMonth(values[1]);
  };

  // update bubbleData when date range changes
  useEffect(() => { 
    if (selectedSVG === 'bubbleChart') {
      setBubbleData(chartDataAggregator.getRouteData(RouteData, startMonth + 1, endMonth + 1));
    } else if (selectedSVG === 'streamChart') {
      setStreamData(chartDataAggregator.prepareAirlineStreamGraph(AirlineData, startMonth + 1, 
                      endMonth + 1, "TotalTraffic"));
    } else {
      console.log('nothing');
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
    svgComponent = <BubbleChart data={bubbleData} attr1Name={"traffic"} attr2Name={'delay'} attr3Name={'route'}/>;
  } else if (selectedSVG === 'streamChart') {
    svgComponent = <StreamChart data={streamData} attr1Name={"Month"} attr2Name={'delay'} attr3Name={''}/>;
  } else if (selectedSVG === 'otherSVGType') {
    console.log('otherSVGType');
  }
  // Add more conditions for other SVG types as needed
  return (
    <div class="container">
      <div class="container-header">
        <h1>Stats</h1>
        <div>
          This page shows different visualization on summary statistics.
        </div>
      </div>
      <div class="sub-container">

        {/* Add other filters here */}
        <div>
          <button onClick={() => changeSVG('bubbleChart')}>Show Bubble Chart</button>
          <button onClick={() => changeSVG('streamChart')}>Show Stream Chart</button>
          <button onClick={() => changeSVG('otherSVGType')}>Show Other SVG</button>
        {/* Add buttons for other SVG types */}
        </div>

        <div class="svg-container">
          <div>
            <DateRangePicker initStart={startMonth} initEnd={endMonth} handleChange={handleMonthChange}></DateRangePicker>
          </div>
          {svgComponent}
        </div>
      </div>
    </div>
  );
};