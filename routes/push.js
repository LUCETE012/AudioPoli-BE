var express = require('express');
var router = express.Router();

var { admin } = require('../app.js');

// var serviceAccount = require('../audiopoli-6b817-firebase-adminsdk-qqe2o-5863b9f7f0.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

const messaging = admin.messaging();

router.get('/', function (req, res, next) {
    let target_token =
        'dnGNqJ7yRQGsPInpeFHJ2o:APA91bF9D23HLS3hMjiwb_hHZWPDWHc0NE5JgkVr79nKvc3ZwZQfddA_Z-3St0ap6t7x1Smz67-ZHRmXuf0Zg-97eHpEff5GHbHmigdRz8bEs9o2DSDdA92uf-bGxhtr0WOwdf7AOBqF'; // 푸시 메시지를 받을 디바이스의 토큰값

    let message = {
        notification: {
            title: 'send test data',
            body: 'test',
        },
        token: target_token,
    };

    // admin
    //     .messaging()
    messaging
        .send(message)
        .then(function (response) {
            console.log('Succes : ', response);
        })
        .catch(function (err) {
            console.log('Error : ', err);
        });

    res.send('push');
});

module.exports = router;
