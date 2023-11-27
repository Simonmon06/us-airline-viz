import React, { useState, useEffect } from "react";
import UsMap from "../charts/UsMap";
import * as d3 from 'd3'
import { getTopRoutes } from './utils'; 
import us from '../../data/states-albers-10m.json';
import routeFile from '../../data/route_data.json';
import airLineFile from '../../data/airline_data.json'
import metadata from '../../data/metadata.json'
import exampleData from '../../data/us-state-capitals.json'
import BarCharts from "../charts/BarCharts";
import test_weather from '../../data/test_weather.json'

export const Home = () => {
  const [routeData, setRouteData] = useState();
  const [topRoutesData, setTopRoutesData] = useState();
  const [usMapData, setUsMapData] = useState();
  // const [loading, setLoading] = useState(true);
  // const routeData = JSON.parse(routeFile);
  useEffect(() => {
    // Process the data as needed. For example:
    const routeData = JSON.parse(routeFile);

    setUsMapData(us)
    setRouteData(routeData)
    const topRoutesData = getTopRoutes(routeData, 10);

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
    
    setTopRoutesData(routesWithCoords)
  }, []);
  
  // console.log(topRoutesData)
  // console.log('topRoutes',topRoutes)
  // console.log('usMapData', usMapData)
  return (
    <div>
      <UsMap topRoutesData={topRoutesData} usMapData={usMapData}/>
      <BarCharts dataset={test_weather}/>
    </div>

  )


};