import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';

// *********  Utilities  *********
import DateRangePicker from '../commons/DateRangePicker/DateRangePicker';
import { chartDataAggregator, Constants } from '../commons/utils';

// *********  Charts  *********
import BubbleChart from "../charts/ColoredBubbleChart";
import StreamChart from '../charts/StreamChart';

// *********  Data  *********
import RouteDataString from '../../data/route_data.json';
import AirlineDataString from '../../data/airline_data.json';
import { Button, ButtonGroup } from 'react-bootstrap';

// *******  Page2  ********
const AirlineData = JSON.parse(AirlineDataString); // [{}]
const RouteData = JSON.parse(RouteDataString); // [{}]

export const StatPage = () => {
  // init svg type
  const [selectedSVG, setSelectedSVG] = useState('bubbleChart'); // Initial state for BubbleChart

  // init date range
  const [startMonth, setStartMonth] = useState(Constants.initStartMonth); // init: March
  const [endMonth, setEndMonth] = useState(Constants.initEndMonth); // init: June

  // init chart data
  const [bubbleData, setBubbleData] = useState(chartDataAggregator.getRouteData(RouteData, startMonth, endMonth));
  const [streamData, setStreamData] = useState(chartDataAggregator.prepareAirlineStreamGraph(AirlineData, startMonth, endMonth, "TotalTraffic"));

  // pipe datepicker value change to Page2
  const handleMonthChange = (values) => {
    setStartMonth(values[0]);
    setEndMonth(values[1]);
  };

  function myClickFn(e) {
    var chart_type = e.target.getAttribute('type');
    if (chart_type === 'bubble') {
      changeSVG('bubbleChart')
    } else {
      changeSVG('streamChart')
    }
  }

  // update bubbleData when date range changes
  useEffect(() => {

    document.getElementById("stat-description-div").innerHTML = "";

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
    svgComponent = <BubbleChart data={bubbleData} attr1Name={"traffic"} attr2Name={'delay'} attr3Name={'route'} />;
  } else if (selectedSVG === 'streamChart') {
    svgComponent = <StreamChart data={streamData} attr1Name={"Month"} attr2Name={'delay'} attr3Name={''} />;
  } else if (selectedSVG === 'otherSVGType') {
    console.log('');
  }
  // Add more conditions for other SVG types as needed
  return (
    <div class="container">
      <div class="container-header">
        <h1>Flgiht Statistics</h1>
      </div>
      <div>
        <ButtonGroup size="lg" className="mb-2">
          <Button variant="pug" type="bubble" onClick={myClickFn}>Route Traffic</Button>
          <Button variant="pug" type="stream" onClick={myClickFn}>Airline Traffic</Button>
          <Button variant="pug" type="placeholder" style={{ pointEvents: "none", cursor: "default" }}>More</Button>
        </ButtonGroup>
      </div>
      <div>

      </div>
      <div>
        <DateRangePicker initStart={startMonth} initEnd={endMonth} handleChange={handleMonthChange}></DateRangePicker>
      </div>
      <div class="stat-container">
        {/* chart menu */}

        {/* SVG container */}
        <div class="stat-sub-left">
          <div class="svg-container">
            {svgComponent}
          </div>
        </div>

        {/* information container */}
        <div class="stat-sub-right">
          <div>
            <h2 style={{ margin: "none", marginTop: "5px" }}>Details</h2>
          </div>
          <div id="stat-description-div"
            style={{ border: "1px solid black", marginTop: "1px", marginRight: "1%", minHeight: "40%" }}></div>
        </div>

      </div>
    </div>
  );
};