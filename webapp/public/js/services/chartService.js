var chartService = [
	function () {
		var emotions = ["Neutral", "Happy", "Sad", "Angry"],
			happy = 'url(/image/happy.png)',
			sad = 'url(/image/sad.png)',
			angry = 'url(/image/angry.png)',
			neutral = 'url(/image/neutral.png)';

		function polarChart(data) {
			var emotion, index, emap = [0,0,0,0];
			for (index=0;index<data.length;++index) {
				emotion = data[index].name;
				emap[emotions.indexOf(emotion)]++;
			}
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
		            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f} occurence(s)</b><br/>'
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
		            pointPlacement: 'on',
		            color: '#BF0B23'
		        }]

		    });
		}

		function timeline(data) {
			var series = {
				angry: [], 
				neutral: [], 
				happy: [], 
				sad: []
			}, emotion, index, emoidx,  maxX, minX, ts;
			for (index=0;index<data.length;++index) {
				emotion = data[index].name;
				if (!series[emotion.toLowerCase()]) {
					continue;
				}
				emoidx = emotions.indexOf(emotion);
				ts = data[index].ts;
				series[emotion.toLowerCase()].push([ts, emoidx]);
				if (!minX || ts < minX) {
					minX = ts;
				}
				if (!maxX || ts > maxX) {
					maxX = ts;
				}
			}
			minX = minX < 50 ? 0 : minX - 50;
			maxX += 50;
			$('#chartContainer').highcharts({
	        	chart: { type: 'scatter' },
		        title: { text: 'Emotion timeline' },
		        subtitle: { text: 'How each emotion changes with time' },
		        xAxis: {
		        	min: minX,
		        	max: maxX,
		            type: 'linear',
		            title: { text: 'Timestamp' }
		        },
		        yAxis: {
		            min: 0,
		            max: 3,
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
		            name: 'happy',
		            data: series.happy,
		            marker: {
		                symbol: happy
		            }
		        }, {
		            name: 'neutral',
		            data: series.neutral,
		            marker: {
		                symbol: neutral
		            }
		        }, {
		            name: 'angry',
		            data: series.angry,
		            marker: {
		                symbol: angry
		            }
		        }, {
		            name: 'sad',
		            data: series.sad,
		            marker: {
		                symbol: sad
		            }
		        }]
		    });
		}

		function combinedTimeline(data) {
			var series = {
				angry: [], 
				neutral: [], 
				happy: [], 
				sad: []
			}, emotion, index, emoidx, minX, maxX, ts;
			for (index=0;index<data.length;++index) {
				emotion = data[index].name.toLowerCase();
				if (!series[emotion]) {
					continue;
				}
				ts = data[index].ts;
				series[emotion].push([ts, 1]);
				if (!minX || ts < minX) {
					minX = ts;
				}
				if (!maxX || ts > maxX) {
					maxX = ts;
				}
			}
			minX = minX < 50 ? 0 : minX - 50;
			maxX += 50;
			$('#chartContainer').highcharts({
	        	chart: { type: 'scatter' },
		        title: { text: 'Emotion timeline' },
		        subtitle: { text: 'How all emotions change with time' },
		        xAxis: {
		        	min: minX,
		        	max: maxX,
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
		            }, 
		            labels: {
		            	enabled: false
		            },
		            minorTickInterval: null
		        },
		        tooltip: {
		            headerFormat: '<b>{series.name}</b><br>',
		            pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
		        },

		        series: [{
		            name: 'happy',
		            data: series.happy,
		            marker: {
		                symbol: happy
		            }
		        }, {
		            name: 'neutral',
		            data: series.neutral,
		            marker: {
		                symbol: neutral
		            }
		        }, {
		            name: 'angry',
		            data: series.angry,
		            marker: {
		                symbol: angry
		            }
		        }, {
		            name: 'sad',
		            data: series.sad,
		            marker: {
		                symbol: sad
		            }
		        }]
		    });
		}

		function chartNotSupported() {
			var element = $("<div>").text("Unsupported chart type");
			return element;	
		}

		return {
			polarChart: polarChart,
			timeline: timeline,
			combinedTimeline: combinedTimeline,
			drawChart: function(chartType, data) {
				if (chartType === 1) {
					timeline(data);
				} else if (chartType === 2) {
					polarChart(data);
				} else if (chartType === 3) {
					combinedTimeline(data);
				} else {
					// chart type not supported
					console.log("Unsupported chart type");
				}
			}
		};
	}
];