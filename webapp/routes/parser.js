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
