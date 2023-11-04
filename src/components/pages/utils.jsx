export const getTopRoutes = (routeData, topX) => {
    return routeData
      .sort((a, b) => b.TotalTraffic - a.TotalTraffic)
      .slice(0, topX);
};