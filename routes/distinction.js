var express = require('express');
var router = express.Router();

var admin = require('firebase-admin');

var serviceAccount = require('../audiopoli-6b817-firebase-adminsdk-qqe2o-5863b9f7f0.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://audiopoli-6b817-default-rtdb.firebaseio.com',
});

const db = admin.database();

const mikesample = {
    id: 3254647,
    date: '2024-01-28',
    time: '12:33',
    latitude: 37.5058,
    longititude: 126.956,
    sound: 'base 64 string',
};

const AI_result = 3;

function detailToCategory(detail) {
    switch (detail) {
        case 1:
        case 2:
        case 3:
        case 4:
            return 1;
            break;
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            return 2;
            break;
        case 10:
        case 11:
            return 4;
            break;
        case 12:
        case 13:
            return 3;
            break;
        case 14:
            return 5;
            break;
        case 15:
        case 16:
            return 6;
            break;
    }
}

/* GET home page. */
router.get('/', function (req, res, next) {
    var result = mikesample;
    const updates = {};
    const userRef = db.ref(`/${result.id}`);

    result.detail = AI_result;
    result.category = detailToCategory(AI_result);
    result.isCrime = false;
    result.departureTime = '';
    result.caseEndTime = '';

    updates[result.id.toString()] = result;

    userRef.update(result, (error) => {
        if (error) {
            console.error('Error adding user:', error);
        } else {
            console.log('User added successfully!');
        }
    });

    res.send(result);
});

module.exports = router;
