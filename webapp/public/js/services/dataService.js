var dataService = [
	function () {
		var emotions = ["Neutral", "Happy", "Sad", "Surprised", "Angry"];

		var mockedContent = parseArrayToNote([
			{timestamp: "01:00", status: "Happy"},
			{timestamp: "02:00", status: "Sad"},
			{timestamp: "03:00", status: "Neutral"},
			{timestamp: "04:30", status: "Angry"},
			{timestamp: "06:30", status: "Surprised"},
			{timestamp: "07:30", status: "Happy"}
		]);

		function parseArrayToNote(data) {
			var newNote = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE en-note SYSTEM \"http://xml.evernote.com/pub/enml2.dtd\">";
			newNote += "<en-note>";
			for(var i in data) {
				var elem = data[i];
				newNote += "<div>" + elem.timestamp + " " + elem.status + "</div>";
			}
			newNote += "</en-note>";
			return newNote;
		}

		function parseStringToTS(str) {
			var parts = str.split(":"),
				min = parseInt(parts[0]),
				sec = parseInt(parts[1]),
				ts = sec + min * 60;
			return ts;
		}


		function getChartDataFromContent(content) {
			// mock content data for now
			content = mockedContent;

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