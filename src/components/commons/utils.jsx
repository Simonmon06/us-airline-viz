class chartDataAggregator {
    static getRouteData = (routes, startMonth, endMonth, topK = 10) => {
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
        for (let i = 0; i < sortedAggregatedRoutes.length; i++) {
            let route = sortedAggregatedRoutes[i];
            answer.push({
                route: route[0],
                traffic: route[1][0],
                delay: route[1][1] / route[1][0]
            })
        }
        return answer
    }

    static prepareAirlineStreamGraph = (data, startMonth, endMonth, attr) => {
        let filtered_data = data.filter(
            airline => Number(airline.Month) >= startMonth && Number(airline.Month) <= endMonth);

        let stackedData = filtered_data.reduce((acc, airline) => {
            if (!acc[airline.Month]) { acc[airline.Month] = {} }
            acc[airline.Month][airline.Airline] = airline[attr];
            return acc
        }, {});

        let answer = [];
        Object.keys(stackedData).forEach(month => {
            answer.push({ Month: Number(month), ...stackedData[month] });
        });

        // console.log('utis', answer);
        return answer
    }

}

const appConstants = {
    initStartMonth: 2,
    initEndMonth: 5
}

export { chartDataAggregator, appConstants }