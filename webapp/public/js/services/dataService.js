var dataService = [
	function () {
		var emotions = ["neutral", "happy", "sad", "surprised", "angry"];
		function getChartDataFromContent(content) {
			// mock content data for now
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
			getChartDataFromContent: getChartDataFromContent
		};
	}
];