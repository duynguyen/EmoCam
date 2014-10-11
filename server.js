// modules =================================================
var express        = require('express');
var app            = express();
// var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var session	       = require('express-session');
var cookieParser   = require('cookie-parser');

// configuration ===========================================
	
// config files
var db = require('./config/db');

var port = process.env.PORT || 8080; // set our port
// mongoose.connect(db.url);

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(session({secret: 'keyboard cat'}));
app.use(cookieParser('secret'));
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// models ==============================================
var VidNote = require('./app/models/vid-note');

// routes / controllers (TODO refactor) ==================================================
require('./routes/vid-notes')(app, VidNote); // configure our routes

// start app ===============================================
app.listen(port);										// startup our app at http://localhost:8080
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app
