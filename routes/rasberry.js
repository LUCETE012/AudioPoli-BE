var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var {Storage} = require('@google-cloud/storage');

var admin = require('firebase-admin');

// global.serviceAccount = require('../audiopoli-28904-firebase-adminsdk-t43gt-10e01b1c11.json');
var serviceAccount = require('../audiopoli-6b817-firebase-adminsdk-qqe2o-cc608bd744.json');
const { response } = require('../app');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://audiopoli-6b817.appspot.com',
    // databaseURL: 'https://audiopoli-28904-default-rtdb.firebaseio.com',
    databaseURL: "https://audiopoli-6b817-default-rtdb.firebaseio.com",
});

const db = admin.database();
const bucket = admin.storage().bucket();
const upload = multer({storage: multer.memoryStorage()});
const userRef = db.ref('/');

function detailToCategory(detail) {
    const categoryMap = {
        1: 1, 2: 1, 3: 1, 4: 1,
        5: 2, 6: 2, 7: 2, 8: 2, 9: 2,
        10: 4, 11: 4,
        12: 3, 13: 3,
        14: 5,
        15: 6, 16: 6,
    };
    return (categoryMap[detail] || null);
}

function initResult(req)
{
    var result = {
        id: Number(req.body.id),
        date: req.body.date,
        time: req.body.time,
        latitude: Number(req.body.latitude),
        longitude: Number(req.body.longitude),
        sound: null,
        detail: null,
        category: null,
        isCrime: false,
        caseEndTime: "99:99:99",
        departureTime: "99:99:99",
    };
    return (result);
}

function uploadToStorage(req) {
    return new Promise((resolve, reject) => {
        const file = bucket.file(req.file.originalname);
        const stream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
        });
        stream.on('error', (error) => {
            reject(error); // 오류 발생 시 Promise를 reject 합니다.
        });
        stream.on('finish', async () => {
            try {
                await file.makePublic();
                const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
                console.log(url);
                resolve(url); // 파일 업로드 완료 시 URL을 resolve 합니다.
            } catch (error) {
                reject(error); // 오류 발생 시 Promise를 reject 합니다.
            }
        });
        stream.end(req.file.buffer);
    });
}

function uploadToAI(url)
{
    return (3);
}

function uploadToDashboard()
{

}

router.post('/', upload.single('sound'), async (req, res) => {
    if (!req.file)
        console.log('File is not provided');

    var result = initResult(req);

    result.sound = await uploadToStorage(req);

    result.detail = Number(uploadToAI(result.sound));
    result.category = Number(detailToCategory(result.detail));
    
    const itemRef = userRef.child(result.id.toString());
    itemRef.set(result, (error) => {
        if (error) {
            console.error('Error adding user with custom title:', error);
        } else {
            console.log('User added successfully with custom title!');
        }
    });
    res.send(result);
});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'rasberry' });
});

module.exports = router;
