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
			var series = {
				angry: [], 
				neutral: [], 
				happy: [], 
				sad: [], 
				surprised: []
			}, emotion, index, emoidx;
			for (index=0;index<data.length;++index) {
				emotion = data[index].name;
				emoidx = emotions.indexOf(emotion);
				series[emotion].push([data[index].ts, emoidx]);
			}
			console.log(series.angry);
			$('#chartContainer').highcharts({
	        	chart: { type: 'scatter' },
		        title: { text: 'Emotion timeline' },
		        subtitle: { text: 'How each emotion changes with time' },
		        xAxis: {
		            type: 'linear',
		            title: { text: 'Timestamp' }
		        },
		        yAxis: {
		            min: 0,
		            max: 4,
		            minTickInterval: 1,
		            gridLineWidth: 0,
		            categories: emotions,
		            title: {
		            	text: "Emotion"
		            }
		        },
		        tooltip: {
		            headerFormat: '<b>{series.name}</b><br>',
		            pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
		        },

		        series: [{
		            name: 'angry',
		            data: series.angry
		        }, {
		            name: 'neutral',
		            data: series.neutral
		        }, {
		            name: 'sad',
		            data: series.sad
		        }, {
		            name: 'surprised',
		            data: series.surprised
		        }, {
		            name: 'happy',
		            data: series.happy
		        }]
		    });
		}

		function combinedTimeline(data) {
			var series = {
				angry: [], 
				neutral: [], 
				happy: [], 
				sad: [], 
				surprised: []
			}, emotion, index, emoidx;
			for (index=0;index<data.length;++index) {
				emotion = data[index].name;
				series[emotion].push([data[index].ts, 1]);
			}
			console.log(series.angry);
			$('#chartContainer').highcharts({
	        	chart: { type: 'scatter' },
		        title: { text: 'Emotion timeline' },
		        subtitle: { text: 'How all emotions change with time' },
		        xAxis: {
		            type: 'linear',
		            title: { text: 'Timestamp' }
		        },
		        yAxis: {
		            min: 0,
		            max: 2,
		            minTickInterval: 1,
		            gridLineWidth: 0,
		            title: {
		            	text: "Emotion"
		            }
		        },
		        tooltip: {
		            headerFormat: '<b>{series.name}</b><br>',
		            pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
		        },

		        series: [{
		            name: 'angry',
		            data: series.angry
		        }, {
		            name: 'neutral',
		            data: series.neutral
		        }, {
		            name: 'sad',
		            data: series.sad
		        }, {
		            name: 'surprised',
		            data: series.surprised
		        }, {
		            name: 'happy',
		            data: series.happy
		        }]
		    });
		}

		function chartNotSupported() {
			var element = $("<div>").text("Unsupported chart type");
			return element;	
		}

		function getChartData(chartId) {
			// TODO: generate mocked data for now, to be replaced by concrete data later
			var from = 0, to = 500,
				data = [], index, recorded, emotion;
			for (index=from;index<to;index++) {
				recorded = Math.random();
				if (recorded < 0.15) {
					emotion = emotions[parseInt(Math.random() * emotions.length)];
					if (data.length > 0) {
						if (emotion === data[data.length-1].name) {
							continue;
						}
					}
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
			combinedTimeline: combinedTimeline,
			drawChart: function(chartType, chartId, options) {
				var data = getChartData(chartId),
					output;
				if (chartType === 1) {
					console.log("timeline");
					timeline(data);
				} else if (chartType === 2) {
					// polar chart
					console.log("polar");
					polarChart(data);
				} else if (chartType === 3) {
					combinedTimeline(data);
				} else {
					// chart type not supported
					console.log("Unsupported chart type");
				}
				return output;
			}
		};
	}
]);