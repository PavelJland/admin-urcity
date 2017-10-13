var express  = require('express');
var app      = express();
var port     = process.env.PORT || 5000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash  = require('connect-flash');
var bodyParser = require('body-parser');

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');


var cron = require('node-cron');
var configDB = require('./config/database.js');

mongoose.connect(configDB.url);

const querystring = require('querystring');


require('./config/passport')(passport);
app.use(morgan('dev'))
// app.configure(function() {
	app.set('view engine', 'ejs');
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: false })); 
	app.use(cookieParser('keyboard cat'));
	app.use(express.static('public'));
	// app.use(express.logger('dev'));
     app.use(cookieParser());
    // app.use(express.session({ cookie: { maxAge: 60000 }}));
	// app.use(express.cookieParser());
	app.use(session({ secret: 'KKK' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
// });

require('./app/routes.js')(app, passport);

app.listen(port);


console.log('The magic happens on port ' + port);
