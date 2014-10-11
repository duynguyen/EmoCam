var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VidNoteSchema = new Schema({
	name: String
});

module.exports = mongoose.model('VidNote', VidNoteSchema);
