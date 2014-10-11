module.exports = function(app, VidNote) {
	app.use(function(req, res, next) {
		// do logging
		console.log('Something is happening.');
		next(); // make sure we go to the next routes and don't stop here
	});

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes
	app.get('/api', function(req, res) {
		res.json({ message: 'hooray! welcome to our api!' });	
	});

	app.get('/api/notes', function(req, res) {
		// use mongoose to get all nerds in the database
		VidNote.find(function(err, notes) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

			res.json(notes); // return all nerds in JSON format
		});
	});

	app.post('/api/notes', function(req, res) {
		var note = new VidNote(); 		// create a new instance of the Nerd model
		note.name = req.body.name;  // set the nerd's name (comes from the request)

		// save the nerd and check for errors
		note.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Note created!' });
		});
	});

	app.get('/api/notes/:note_id', function(req, res) {
		// use mongoose to get all nerds in the database
		VidNote.findById(req.params.note_id, function(err, note) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

			res.json(note);
		});
	});

	app.put('/api/notes/:note_id', function(req, res) {
		// use mongoose to get all nerds in the database
		VidNote.findById(req.params.note_id, function(err, note) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

			note.name = req.body.name;

			note.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Note updated!' });
			});
			
		});
	});

	app.delete('/api/notes/:note_id', function(req, res) {
		VidNote.remove({
			_id: req.params.note_id
		}, function(err, note) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/html/index.html'); // load our public/index.html file
	});
};
