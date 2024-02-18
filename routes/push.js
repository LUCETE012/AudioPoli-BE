var express = require('express');
var router = express.Router();

var { admin } = require('../app.js');

// var serviceAccount = require('../audiopoli-6b817-firebase-adminsdk-qqe2o-5863b9f7f0.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

const messaging = admin.messaging();

router.get('/', function (req, res, next) {
    const db = admin.database();
    const useRef = db.ref('/users');
    let target_tokens = [];

    useRef.on(
        'value',
        (snapshot) => {
            target_tokens = Object.keys(snapshot.val());
        },
        (errorObject) => {
            console.log(errorObject.name);
        }
    );

    let message = {
        notification: {
            title: 'NEW ISSUE',
            body: 'Please check for any new issues in the nearby area!',
        },
        tokens: target_tokens,
    };

    messaging.sendMulticast(message).then((response) => {
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(registrationTokens[idx]);
                }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
        }
    });
    // messaging
    //     .send(message)
    //     .then(function (response) {
    //         console.log('Succes : ', response);
    //     })
    //     .catch(function (err) {
    //         console.log('Error : ', err);
    //     });

    res.send('push');
});

module.exports = router;
