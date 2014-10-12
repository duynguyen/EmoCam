var dataService = [
	function () {
		var emotions = ["Neutral", "Happy", "Sad", "Surprised", "Angry"];

		function parseStringToTS(str) {
			var parts = str.split(":"),
				hour = 0, min = 0, sec = 0, ts;
			if (parts.length == 2) {
				min = parseInt(parts[0]);
				sec = parseInt(parts[1]);
			} else if (parts.length == 3) {
				hour = parseInt(parts[0]);
				min = parseInt(parts[2]);
				sec = parseInt(parts[2]);
			} else {
				return null;
			}
			ts = sec + min * 60 + hour * 3600;
			return ts;
		}


		function getChartDataFromContent(content) {
			var data = [], 
				emNote = $(content)[1],
				divs = $(emNote).find("div"),
				index = 0, emotion;
			$.each(divs, function(index, value) {
				var parts = $(value).text().split(" "),
					ts = parseStringToTS(parts[0])
					emotion = parts[1];
				data.push({
					ts: ts,
					name: emotion
				});
			});
			return data;
		}

		return {
			getChartDataFromContent: getChartDataFromContent
		};
	}
];