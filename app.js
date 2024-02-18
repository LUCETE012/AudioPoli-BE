var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var admin = require('firebase-admin');
var serviceAccount = require('./audiopoli-6b817-firebase-adminsdk-qqe2o-5863b9f7f0.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://audiopoli-6b817-default-rtdb.firebaseio.com',
});
exports.admin = admin;

var indexRouter = require('./routes/index');
var distinctRouter = require('./routes/distinction');
var rasberryRouter = require('./routes/rasberry');
var pushRouter = require('./routes/push');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/distinction', distinctRouter);
app.use('/rasberry', rasberryRouter);
app.use('/push', pushRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

exports.app = app;
