import React, { useState, useEffect } from "react";
import UsMap from "../charts/UsMap";
import * as d3 from 'd3'
import { getTopRoutes, filterRoutesByMonthRange, getUniqueAirportsData } from './utils'; 
import us from '../../data/states-albers-10m.json';
import routeFile from '../../data/route_data.json';
import airLineFile from '../../data/airline_data.json'
import metadata from '../../data/metadata.json'
import exampleData from '../../data/us-state-capitals.json'
import BarCharts from "../charts/BarCharts";
import test_weather from '../../data/test_weather.json'
import DateRangePicker from '../commons/DateRangePicker/DateRangePicker'

import { chartDataAggregator, Constants } from '../commons/utils';

export const Home = () => {
  //data
  const [routeData, setRouteData] = useState();
  const [topRoutesData, setTopRoutesData] = useState();
  const [usMapData, setUsMapData] = useState();
  const [airLineData, setAirLineData] = useState();
  const [uniqueAirportsData, setUniqueAirportsData] = useState();
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
      console.log('airLineData', airLineData)
      console.log('routeData', routeData)
      console.log('metadata', metadata)
      console.log('startMonth', startMonth)

      const filteredRoutesByMonth = filterRoutesByMonthRange(routeData, startMonth+1, endMonth+1)
      const topRoutesData = getTopRoutes(filteredRoutesByMonth, topK);
      const routesWithCoords = topRoutesData.map(route => {
      const [sourceCode, destCode] = route.Route.split('-');
    
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
    
  }, [routeData, startMonth, endMonth, topK]);


  const handleMonthChange = (values) => {
    setStartMonth(values[0]);
    setEndMonth(values[1]);
  };

  const handleTopKChange = (e) => {
    setTopK(Number(e.target.value)); // Update topK state when a new option is selected
  };

  
  return (
    <div>
      <DateRangePicker initStart={startMonth} initEnd={endMonth} handleChange={handleMonthChange}/>
      <select value={topK} onChange={handleTopKChange}>
        {/* Define dropdown options for top k */}
        <option value={1}>Top 1</option>
        <option value={5}>Top 5</option>
        <option value={10}>Top 10</option>
        <option value={20}>Top 20</option>
        <option value={30}>Top 30</option>
      </select>

      <UsMap topRoutesData={topRoutesData} usMapData={usMapData} uniqueAirportsData={uniqueAirportsData}/>
      <BarCharts dataset={test_weather}/>
    </div>

  )


};