exports.parseArrayToNote = function(data) {
	var newNote = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE en-note SYSTEM \"http://xml.evernote.com/pub/enml2.dtd\">";
	newNote += "<en-note>";
	for(var i in data) {
		var elem = data[i];
		newNote += "<div>" + elem.timestamp + " " + elem.status + "</div>";
	}
	newNote += "</en-note>";
	return newNote;
};

exports.interpretRawData = function(rawData) {
	var newData = [];
	var length = rawData.length;
	var minDistance = rawData[length-1].timestamp / 32;
	for(var i in rawData) {
		var thisData = rawData[i];
		if(i == 0) {
			newData.push({timestamp: thisData.timestamp, status: thisData.emotion});
			continue;
		}
		var lastAdded = newData[newData.length - 1];
		if(thisData.timestamp - lastAdded.timestamp > minDistance && thisData.emotion != lastAdded.status) {
			newData.push({timestamp: thisData.timestamp, status: thisData.emotion});
		}
	}
	for(var j in newData) {
		newData[j].timestamp = parseLongtoTimeString(newData[j].timestamp, newData[newData.length - 1].timestamp > 3600000);
	}
	return newData;
};

var parseLongtoTimeString = function(timeInMillis, containsHour) {
	var hours = 0;
	if(containsHour) {
		hours = parseInt(timeInMillis / 3600000);
		timeInMillis = timeInMillis - hours * 3600000;
	}
	var minutes = parseInt(timeInMillis / 60000);
	timeInMillis = timeInMillis - minutes * 60000;
	var seconds = parseInt(timeInMillis / 1000);
	return (containsHour ? interpolateNumtoString(hours) + ":" : "") + interpolateNumtoString(minutes) + ":" + interpolateNumtoString(seconds);
};

var interpolateNumtoString = function(num) {
	return "" + (num < 10 ? "0" + num : num);
}
