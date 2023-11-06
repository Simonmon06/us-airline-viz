
class chartDataAggregator {
    static getRouteData = (routes, startMonth, endMonth, topK=10) => {
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

    static getAirlineData = (airlines, startMonth, endMonth) => {
        let filteredAirlines = airlines.filter(airline => Number(airline.Month) >= startMonth && Number(airline.Month) <= endMonth);
        let aggregatedAirlines = filteredAirlines.reduce((acc, airline) => {
            if (!acc[airline.Airline]) { acc[airline.Airline] = [airline.TotalTraffic, airline.TotalDepDelay]; }
            acc[airline.Airline][0] += airline.TotalTraffic;
            acc[airline.Airline][1] += airline.TotalDepDelay;
            return acc
        }, {});
        let sortedAggregatedAirlines = Object.entries(aggregatedAirlines)
            .sort((a, b) => b[1][0] - a[1][0]); // Sort in descending order; for ascending, use a[1] - b[1]
        let answer = [];
        for (let i=0; i<sortedAggregatedAirlines.length; i++) {
            let airline = sortedAggregatedAirlines[i];
            answer.push({
            airline: airline[0],
            traffic: airline[1][0],
            delay: airline[1][1] / airline[1][0]
            })
        }
        return answer
    }

}

export { chartDataAggregator}