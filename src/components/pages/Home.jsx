import React, { useState, useEffect } from "react";
import UsMap from "../charts/UsMap";
import * as d3 from 'd3'
import { getTopRoutes, filterSelectedRoutesByMonthRange, getUniqueAirportsData } from './utils'; 
import us from '../../data/states-albers-10m.json';
import routeFile from '../../data/route_data.json';
import airLineFile from '../../data/airline_data.json'
import metadata from '../../data/metadata.json'
import BarCharts from "../charts/BarCharts";
import DateRangePicker from '../commons/DateRangePicker/DateRangePicker'
import './Home.css';
import { Container, Row, Col } from 'react-bootstrap';

import { chartDataAggregator, Constants } from '../commons/utils';

export const Home = () => {
  //data
  const [routeData, setRouteData] = useState();
  const [topRoutesData, setTopRoutesData] = useState();
  const [usMapData, setUsMapData] = useState();
  const [airLineData, setAirLineData] = useState();
  const [uniqueAirportsData, setUniqueAirportsData] = useState();
  const [selectedRoute, setSelectedRoute] = useState('');

  // const [loading, setLoading] = useState(true);
  // init date range
  const [startMonth, setStartMonth] = useState(Constants.initStartMonth); // init: March
  const [endMonth, setEndMonth] = useState(Constants.initEndMonth); // init: June
  const [topK, setTopK] = useState(10); // state for storing the selected top k value

  // set up the initial state
  useEffect(()=>{

    const parsedRouteData = JSON.parse(routeFile);
    const parsedAirLineFile = JSON.parse(airLineFile);
    setUsMapData(us)
    setRouteData(parsedRouteData)
    setAirLineData(parsedAirLineFile)
  }, [])


  useEffect(() => {

    if(routeData) {
      if(selectedRoute){
        const filteredData = filterSelectedRoutesByMonthRange(routeData, startMonth+1, endMonth+1, selectedRoute)
      }

      const topKRoutes = chartDataAggregator.getRouteData(routeData,  startMonth+1, endMonth+1, topK)

      const routesWithCoords = topKRoutes.map(route => {
      const [sourceCode, destCode] = route.route.split('-');
      return {
          ...route,
          source: metadata.airport_coords[sourceCode],
          destination: metadata.airport_coords[destCode],
          sourceCode: sourceCode,
          destCode: destCode
        };
      });
      
      const uniqueAirports = getUniqueAirportsData(routesWithCoords, metadata)
    
      setTopRoutesData(routesWithCoords) 
      setUniqueAirportsData(uniqueAirports)
    }
    
  }, [routeData, startMonth, endMonth, topK, selectedRoute]);


  // The handler to update the selected route
  const handleRouteChange = (e) => {
    setSelectedRoute(e.target.value);
  };

  const changeSelectedRoute = (newValue) => {
    if (topRoutesData.map(x=>x.route).includes(newValue) || newValue === '') {
      setSelectedRoute(newValue);
    } else {
      alert('invalid click route selection.');
    }
  }
  
  const handleMonthChange = (values) => {
    setStartMonth(values[0]);
    setEndMonth(values[1]);
  };

  const handleTopKChange = (e) => {
    setTopK(Number(e.target.value)); // Update topK state when a new option is selected
    setSelectedRoute("");
  };

  
  return (
    <div className="my-container" id="mapContainer">
      <div>
        <DateRangePicker initStart={startMonth} initEnd={endMonth} handleChange={handleMonthChange}/>
      </div>
      <div id="mapTip"></div>

      <Row>
        <Col md={1} className="mb-2" >
          <select value={topK} onChange={handleTopKChange} >
            <option value={1}>Top 1</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={30}>Top 30</option>
            <option value={50}>Top 50</option>
          </select>
        </Col>
        <Col md={4} className="mb-2">
          <select value={selectedRoute} onChange={handleRouteChange}>
            <option value="">-- Select a Route --</option>
              {topRoutesData && topRoutesData.map((routeData, index) => (
                <option key={index} value={routeData.route}>{routeData.route}</option>
              ))}
            </select>
        </Col>
      </Row>

      <UsMap topRoutesData={topRoutesData} usMapData={usMapData} uniqueAirportsData={uniqueAirportsData}
      selectedRoute={selectedRoute} changeSelectedRoute={changeSelectedRoute}/>
      <BarCharts dataset={topRoutesData}/>
    </div>
  );
  


};