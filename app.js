var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

var admin = require('firebase-admin');
var serviceAccount = require(process.env.SERVICEACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.BUCKETURL,
    databaseURL: process.env.DBURL,
});

exports.admin = admin;

var indexRouter = require('./routes/index');
var distinctRouter = require('./routes/distinction');
var rasberryRouter = require('./routes/rasberry');
var pushRouter = require('./routes/push');
const { promiseHooks } = require('v8');

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

var db = admin.database();
var ref = db.ref('/crime/');
const messaging = admin.messaging();
var bodyText;
const alertMessages = [
    '',
    'Be aware of sexual assault, robbery, theft, and violent crimes occurring nearby, and immediately report any suspicious situations to the police.',
    'Prepare for fires, entrapments, medical emergencies, electrical, and gas accidents by evacuating to a safe place immediately and contacting 119 if necessary.',
    'Anticipate the risk of falls and collapses by avoiding unstable structures and strictly adhering to safety protocols.',
    'With typhoons, strong winds, and earthquakes forecasted, stay indoors if possible and prepare emergency supplies in advance.',
    'If you need assistance, contact 112 or 119 immediately to request urgent help.',
];

ref.on(
    'child_changed',
    function (snapshot) {
        if (snapshot.val().isCrime == 1) {
            const useRef = db.ref('/users');
            useRef.on(
                'value',
                (snapshot2) => {
                    var target_tokens = Object.keys(snapshot2.val());
                    let message = {
                        notification: {
                            title: 'WARNING',
                            body: alertMessages[snapshot.val().category],
                        },
                        tokens: target_tokens,
                    };
                    messaging
                        .sendMulticast(message)
                        .then((response) => {
                            if (response.failureCount > 0) {
                                const failedTokens = [];
                                response.responses.forEach((resp, idx) => {
                                    if (!resp.success) {
                                        failedTokens.push(
                                            registrationTokens[idx]
                                        );
                                    }
                                });
                                console.log(
                                    'List of tokens that caused failures: ' +
                                        failedTokens
                                );
                            }
                        })
                        .catch((error) => {});
                },
                (errorObject) => {
                    console.log(errorObject.name);
                }
            );
        }
    },
    function (errorObject) {
        console.log('The read failed:', errorObject.code);
    }
);

exports.app = app;
