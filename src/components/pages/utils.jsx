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