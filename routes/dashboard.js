var express = require('express');
var router = express.Router();

// var admin = require('firebase-admin');

// var serviceAccount = require('../audiopoli-28904-firebase-adminsdk-t43gt-10e01b1c11.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: 'https://audiopoli-28904-default-rtdb.firebaseio.com',
// });

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('dashboard', { title: 'DB' });
});

module.exports = router;
