var myServices = angular.module("myServices", []);

myServices.factory("chartService", [
	function () {
		
		function polarChart(data, options) {
			var element = $("<ng-polar-chart>").attr({

			});
			return element;
		}

		function timeline(data, options) {
			var element = $("<ng-timeline>").attr({

			});
			return element;
		}

		function chartNotSupported() {
			var element = $("<div>").text("Unsupported chart type");
			return element;	
		}

		function getChartData(chartId) {
			// TODO: mocked data for now, to be replaced by concrete data later
		}

		return {
			polarChart: polarChart,
			timeline: timeline,
			getChart: function(chartType, chartId, options) {
				var data = getChartData(chartId),
					output;
				if (chartType === 1) {
					console.log("timeline");
					output = timeline(data, options);
				} else if (chartType === 2) {
					// polar chart
					console.log("polar");
					output = polarChart(data, options);
				} else {
					// chart type not supported
					console.log("Unsupported chart type");
				}
				return output;
			}
		};
	}
]);