var restService = [
	function (argument) {

		function getNoteMetadata(callback) {
			$.getJSON("/evernote", function(data) {
				callback(data);
			});			
		}

		function getNoteContent(noteGuid, callback) {
			if (noteGuid) {
				$.getJSON("/evernote/content/" + noteGuid, function(data) {
					callback(data);
				});	
			}
		}

		return {
			getNoteMetadata: getNoteMetadata,
			getNoteContent: getNoteContent
		};
	}
];