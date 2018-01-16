var buttons = [
  {id: 1 , name: "Kitchen"} ,
  {id: 2 , name: "Bedroom"} ,
  {id: 3 , name: "Living Room"} ,
  {id: 4 , name: "Garden"} ,
  {id: 1 , name: "Kitchen"} ,
  {id: 2 , name: "Bedroom"} ,
  {id: 3 , name: "Living Room"} ,
  {id: 4 , name: "Garden"} ,
  {id: 1 , name: "Kitchen"} ,
  {id: 2 , name: "Bedroom"} ,
  {id: 3 , name: "Living Room"} ,
  {id: 4 , name: "Garden"} ,
  {id: 1 , name: "Kitchen"} ,
  {id: 2 , name: "Bedroom"} ,
  {id: 3 , name: "Living Room"} ,
  {id: 4 , name: "Garden"} ,
  {id: 1 , name: "Kitchen"} ,
  {id: 2 , name: "Bedroom"} ,
  {id: 3 , name: "Living Room"} ,
  {id: 4 , name: "Garden"} ,
  {id: 1 , name: "Kitchen"} ,
  {id: 2 , name: "Bedroom"} ,
  {id: 3 , name: "Living Room"} ,
  {id: 4 , name: "Garden"} ,
  {id: 4 , name: "Garden"}

];

var rolls = [
  {id: 1 , name: "Kitchen"} ,
  {id: 2 , name: "Bedroom"} ,

];

var port = 3000;
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
//var map = require('./map');
// Create a new Express application.
var app = express();
//app.listen(port);
var http = require('http').Server(app);
var io = require('socket.io')(http);
http.listen(port);

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);

//set public folder
app.use(express.static('public'));

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
var session = require('express-session')({secret: 'keyboard cat', resave: false, saveUninitialized: false });

var sharedsession = require("express-socket.io-session");

app.use(session);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
	require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    res.render('home', { user: req.user , buttons: buttons} );
  });

app.get('/login',
  require('connect-ensure-login').ensureLoggedOut(),
  function(req, res){
    res.render('login');
  });

app.post('/login',
  require('connect-ensure-login').ensureLoggedOut(),
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

//setting socket.io
var connectedClients = 0;

io.use(sharedsession(session, {
    autoSave:true
}));

io.on('connection', function(socket){
  //sda
  console.log(socket.handshake.session.passport);
  if (socket.handshake.session.passport) {
    connectedClients++;
    console.log('New user, total: ' + connectedClients);
  }
  socket.on('led', function(msg){
    io.emit('led',1);


  });

  socket.on('disconnect', function(){
    if (socket.handshake.session.passport) {
      connectedClients--;
      console.log('User dc, total: ' + connectedClients);
    }
  });


});

setInterval(function(){
  if(connectedClients){
    io.emit('led', connectedClients);
  }
}, 2000);
