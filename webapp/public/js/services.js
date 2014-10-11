var myServices = angular.module("myServices", []);

myServices.factory("chartService", [
	function () {
		var emotions = ["neutral", "happy", "sad", "surprised", "angry"]
		
		function polarChart(data) {
			var emotion, index, emap = [0,0,0,0,0];
			for (index=0;index<data.length;++index) {
				emotion = data[index].name;
				emap[emotions.indexOf(emotion)]++;
			}
			// console.log(emap);
			$('#chartContainer').highcharts({
		        chart: { polar: true, type: 'area' },
		        title: {
		            text: 'Emotion Polar Chart',
		            x: -80
		        },
		        pane: { size: '80%' },
		        xAxis: {
		            categories: emotions,
		            tickmarkPlacement: 'on',
		            lineWidth: 0
		        },
		        yAxis: {
		            gridLineInterpolation: 'polygon',
		            lineWidth: 0,
		            min: 0
		        },
		        tooltip: {
		            shared: true,
		            pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
		        },
		        legend: {
		            align: 'right',
		            verticalAlign: 'top',
		            y: 70,
		            layout: 'vertical'
		        },
		        series: [{
		            name: 'Emotion count',
		            data: emap,
		            pointPlacement: 'on'
		        }]

		    });
		}

		function timeline(data) {
			$('#chartContainer').highcharts({
	        	chart: {
		            type: 'spline'
		        },
		        title: {
		            text: 'Snow depth at Vikjafjellet, Norway'
		        },
		        subtitle: {
		            text: 'Irregular time data in Highcharts JS'
		        },
		        xAxis: {
		            type: 'datetime',
		            dateTimeLabelFormats: { // don't display the dummy year
		                month: '%e. %b',
		                year: '%b'
		            },
		            title: {
		                text: 'Date'
		            }
		        },
		        yAxis: {
		            title: {
		                text: 'Snow depth (m)'
		            },
		            min: 0
		        },
		        tooltip: {
		            headerFormat: '<b>{series.name}</b><br>',
		            pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
		        },
		        series: [{
		            name: 'Winter 2007-2008',
		            data: [
		                [Date.UTC(1970,  9, 27), 0   ],
		                [Date.UTC(1970, 10, 10), 0.6 ],
		                [Date.UTC(1970, 10, 18), 0.7 ],
		                [Date.UTC(1970, 11,  2), 0.8 ],
		                [Date.UTC(1970, 11,  9), 0.6 ],
		                [Date.UTC(1970, 11, 16), 0.6 ],
		                [Date.UTC(1970, 11, 28), 0.67],
		                [Date.UTC(1971,  0,  1), 0.81],
		                [Date.UTC(1971,  0,  8), 0.78],
		                [Date.UTC(1971,  0, 12), 0.98],
		                [Date.UTC(1971,  0, 27), 1.84],
		                [Date.UTC(1971,  1, 10), 1.80],
		                [Date.UTC(1971,  1, 18), 1.80],
		                [Date.UTC(1971,  1, 24), 1.92],
		                [Date.UTC(1971,  2,  4), 2.49],
		                [Date.UTC(1971,  2, 11), 2.79],
		                [Date.UTC(1971,  2, 15), 2.73],
		                [Date.UTC(1971,  2, 25), 2.61],
		                [Date.UTC(1971,  3,  2), 2.76],
		                [Date.UTC(1971,  3,  6), 2.82],
		                [Date.UTC(1971,  3, 13), 2.8 ],
		                [Date.UTC(1971,  4,  3), 2.1 ],
		                [Date.UTC(1971,  4, 26), 1.1 ],
		                [Date.UTC(1971,  5,  9), 0.25],
		                [Date.UTC(1971,  5, 12), 0   ]
		            ]
		        }]
		    });
		}

		function chartNotSupported() {
			var element = $("<div>").text("Unsupported chart type");
			return element;	
		}

		function getChartData(chartId) {
			// TODO: generate mocked data for now, to be replaced by concrete data later
			var from = 0, to = 1000,
				data = [], index, recorded, emotion;
			for (index=from;index<to;index++) {
				recorded = Math.random();
				if (recorded < 0.2) {
					emotion = emotions[parseInt(Math.random() * emotions.length)];
					data.push({
						ts: index,
						name: emotion
					});
				}
			}
			return data;
		}

		return {
			polarChart: polarChart,
			timeline: timeline,
			drawChart: function(chartType, chartId, options) {
				var data = getChartData(chartId),
					output;
				if (chartType === 1) {
					console.log("timeline");
					timeline(data, options);
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