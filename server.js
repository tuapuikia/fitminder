// setup =======================================================================
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var ejs = require('ejs');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var multer = require('multer');

var mongoose = require('mongoose');
var passport = require('passport');
var moment = require('moment-timezone');

var raygun = require('raygun');

var app = express();

// configuration ===============================================================
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(partials());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.DATABASE_URL);

require('./config/passport')(passport);

app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: 'fitminder'
    }
));
app.use(passport.initialize());
app.use(passport.session());

app.locals.fromNow = function (date) {
    if (date)
        return moment(date).fromNow();
    else
        return 'never';
}

var raygunClient = new raygun.Client().init({ apiKey: process.env.RAYGUN_APIKEY });

raygunClient.user = function (req) {
    if (req.user) {
        return req.user.encodedId;
    }
}

app.use(raygunClient.expressHandler);

// routes ======================================================================
require('./app/routes')(app, passport);

// listen ======================================================================
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
