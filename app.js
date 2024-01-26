var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var dbRouter = require('./routes/dashboard');

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
app.use('/dashboard', dbRouter);

// connect firebase realtime database
var admin = require('firebase-admin');

var serviceAccount = require('./audiopoli-28904-firebase-adminsdk-t43gt-10e01b1c11.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://audiopoli-28904-default-rtdb.firebaseio.com',
});

const db = admin.database();
const userRef = db.ref('/');

// socket
app.io = require('socket.io')();

app.io.on('connection', (socket) => {
    console.log('새로운 사용자가 연결되었습니다.');

    socket.on('setDB', (msg) => {
        let date = new Date();
        const userData = {
            id: Math.random() * 100,
            date:
                date.getFullYear() +
                '-' +
                date.getMonth() +
                '-' +
                date.getDay(),
            time: date.toTimeString().split(' ')[0],
            latitude: 37.5058,
            longtitude: 126.956,
            sound: 'base 64 string', // 음성
            category: msg, // 대분류
            detail: msg * 2, // 소분류
            isCrime: true, //실제 범죄였는지
        };

        userRef.push(userData, (error) => {
            if (error) {
                console.error('Error adding user:', error);
            } else {
                console.log('User added successfully!');
            }

            // admin.app().delete();
        });
        app.io.emit('setDB', 'okay');
    });

    // DB list 전달
    userRef.on('value', (snapshot) => {
        socket.emit('DBlist', JSON.stringify(snapshot.val()));
    });
});

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

module.exports = app;
