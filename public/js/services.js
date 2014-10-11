var myServices = angular.module("myServices", []);

myServices.factory("chartService", [
	function () {
		
		function polarChart(data, options) {
			$(function () {
			    $('#chartContainer').highcharts({
			        chart: {
			            polar: true
			        },
			        title: {
			            text: 'Highcharts Polar Chart'
			        },
			        pane: {
			            startAngle: 0,
			            endAngle: 360
			        },
			        xAxis: {
			            tickInterval: 45,
			            min: 0,
			            max: 360,
			            labels: {
			                formatter: function () {
			                    return this.value + '°';
			                }
			            }
			        },
			        yAxis: {
			            min: 0
			        },
			        plotOptions: {
			            series: {
			                pointStart: 0,
			                pointInterval: 45
			            },
			            column: {
			                pointPadding: 0,
			                groupPadding: 0
			            }
			        },
			        series: [{
			            type: 'column',
			            name: 'Column',
			            data: [8, 7, 6, 5, 4, 3, 2, 1],
			            pointPlacement: 'between'
			        }]
			    });
			});
		}

		function timeline(data, options) {
			var element = $("<ng-timeline>").attr(options);
			return element;
		}

		function chartNotSupported() {
			var element = $("<div>").text("Unsupported chart type");
			return element;	
		}

		function getChartData(chartId) {
			// TODO: generate mocked data for now, to be replaced by concrete data later
			var from = 0, to = 1000,
				emotions = [{
						key: 0,
						name: "neutral"
					}, {
						key: 1,
						name: "happy"
					}, {
						key: 2,
						name: "sad"
					}, {
						key: 3,
						name: "surprised"
					}, {
						key: 4,
						name: "angry"
				}], data = [], index, recorded, emotion;
			for (index=from;index<to;index++) {
				recorded = Math.random();
				if (recorded < 0.2) {
					emotion = emotions[parseInt(Math.random() * emotions.length)];
					data.push({
						ts: index,
						name: emotion.namme
					});
				}
			}
		}

		return {
			polarChart: polarChart,
			timeline: timeline,
			drawChart: function(chartType, chartId, options) {
				var data = getChartData(chartId),
					output;
				if (chartType === 1) {
					console.log("timeline");
					output = timeline(data, options);
				} else if (chartType === 2) {
					// polar chart
					console.log("polar");
					polarChart(data, options);
				} else {
					// chart type not supported
					console.log("Unsupported chart type");
				}
				return output;
			}
		};
	}
]);