var Evernote = require('evernote').Evernote;
var parser = require('./parser');
var fs = require('fs');
var multer  = require('multer');

var config = require('../config-evernote.json');
var callbackUrl = "http://localhost:8080/evernote/oauth_callback";

var developerToken = "S=s1:U=8fa58:E=15058bc41cf:C=149010b1580:P=1cd:A=en-devtoken:V=2:H=6638a4d7f918382c2e67ad91fdd4810b";

module.exports = function(app, VidNote) {
  app.use(function(req, res, next) {
    // do logging
    res.locals.session = req.session;
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
  });

  app.use(multer({ dest: './public/uploads/' }));

  // server routes ===========================================================
  // handle things like api calls
  // authentication routes
  app.get('/evernote', function(req, res) {
    var client = new Evernote.Client({token: developerToken});
    var noteStore = client.getNoteStore();
    var myNotes = [];
    var filter = new Evernote.NoteFilter;
    filter.ascending = false;

    var rspec = new Evernote.NotesMetadataResultSpec;
    rspec.includeTitle = true;
    rspec.includeContentLength = true;
    rspec.includeCreated = true;
    rspec.includeUpdated = true;
    rspec.includeDeleted = true;
    rspec.includeUpdateSequenceNum = true;
    rspec.includeNotebookGuid = true;
    rspec.includeTagGuids = true;
    rspec.includeAttributes = true;
    rspec.includeLargestResourceMime = true;
    rspec.includeLargestResourceSize = true;

    noteStore.findNotesMetadata(filter, 0, 100, rspec, function(err, noteMetadataList) {
      if(err) {
        res.json({message : err});
      }
      if(!noteMetadataList) {
        res.json({message : "Note list is not found."});
      }
      var notes = noteMetadataList.notes;
      for(var i in notes) {
        myNotes.push(notes[i]);
      }
      res.json(myNotes);
    });
  });

  app.get('/evernote/content/:guid', function(req, res) {
    var client = new Evernote.Client({token: developerToken});
    var noteStore = client.getNoteStore();

    noteStore.getNoteContent(req.params.guid, function(err, noteContent) {
      if(err) {
        res.json({message : err});
      }
      res.json(noteContent);
    });

  });

  app.post('/evernote', function(req, res) {
    var client = new Evernote.Client({token: developerToken});
    var noteStore = client.getNoteStore();
    var noteContent = parser.parseArrayToNote(req.body.content);  // set the nerd's name (comes from the request)
    var newNote = new Evernote.Note;
    newNote.title = req.body.title;
    newNote.content = noteContent;
    noteStore.createNote(newNote, function(err, newNoteCreated) {
      if(err) {
        res.json({message : err});
      }
      var dkey = "visable";
      var dval = "true";
      // noteStore.setNoteApplicationDataEntry(newNoteCreated.guid, dkey, dval);
      // newNoteCreated = noteStore.updateNote(newNoteCreated);
      fs.rename(req.files.noteVideo.path, "public/uploads/" + newNoteCreated.guid, function (err) {
        if (err) throw err;
      });
      res.json(newNoteCreated);
    });
  });

  // OAuth with Evernote
  app.get('/evernote/oauth', function(req, res) {
    var client = new Evernote.Client({
      consumerKey: config.API_CONSUMER_KEY,
      consumerSecret: config.API_CONSUMER_SECRET,
      sandbox: config.SANDBOX
    });

    client.getRequestToken(callbackUrl, function(error, oauthToken, oauthTokenSecret, results){
      if(error) {
        req.session.error = JSON.stringify(error);
        res.json(req.session.error);
      } else {
        // store the tokens in the session
        req.session.oauthToken = oauthToken;
        req.session.oauthTokenSecret = oauthTokenSecret;

        // redirect the user to authorize the token
        res.redirect(client.getAuthorizeUrl(oauthToken));
      }
    });
  });

  app.get('/evernote/oauth_callback', function(req, res) {
    var client = new Evernote.Client({
      consumerKey: config.API_CONSUMER_KEY,
      consumerSecret: config.API_CONSUMER_SECRET,
      sandbox: config.SANDBOX
    });

    client.getAccessToken(
      req.session.oauthToken,
      req.session.oauthTokenSecret,
      req.param('oauth_verifier'),
      function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if(error) {
          console.log('error');
          console.log(error);
          res.redirect('/');
        } else {
          // store the access token in the session
          req.session.oauthAccessToken = oauthAccessToken;
          req.session.oauthAccessTtokenSecret = oauthAccessTokenSecret;
          req.session.edamShard = results.edam_shard;
          req.session.edamUserId = results.edam_userId;
          req.session.edamExpires = results.edam_expires;
          req.session.edamNoteStoreUrl = results.edam_noteStoreUrl;
          req.session.edamWebApiUrlPrefix = results.edam_webApiUrlPrefix;
          res.redirect('/evernote');
        }
      }
    );
  });

  app.get('/evernote/clear', function(req, res) {
    req.session.destroy();
    res.json({ message: 'Session cleared!' });
  });

  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('*', function(req, res) {
    res.sendfile('./public/html/index.html'); // load our public/index.html file
  });
};
