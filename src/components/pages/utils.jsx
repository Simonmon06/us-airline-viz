export const getTopRoutes = (routeData, topX) => {
    return routeData
      .sort((a, b) => b.TotalTraffic - a.TotalTraffic)
      .slice(0, topX);
};

export const filterRoutesByMonthRange = (routeData, startMonth, endMonth) => {
  return routeData.filter(route =>{
    const routeMonth = parseInt(route.Month)
    return routeMonth >= startMonth && routeMonth <= endMonth
  })
}

/**
 * Generates a unique list of airports from a dataset of routes.
 * Each airport is represented once, with its code and corresponding coordinates.
 * @param {Array} data - The array of route objects which includes the source and destination codes.
 * @param {Object} metadata - An object containing additional data, such as airport coordinates.
 * @returns {Array} An array of unique airport objects with `code` and `coords` properties.
 */
export const getUniqueAirportsData = (data, metadata) => {
  const uniqueAirports = new Set()
  data.forEach(route => {
    uniqueAirports.add(route.sourceCode);
    uniqueAirports.add(route.destCode);
  });

  const uniqueAirportsData = Array.from(uniqueAirports).map(code => {
    return {
      code: code,
      coords: metadata.airport_coords[code]
    };
  });

  return uniqueAirportsData
}