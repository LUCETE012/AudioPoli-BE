var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
const dotenv = require("dotenv");
var {Storage} = require('@google-cloud/storage');

dotenv.config();
var admin = require('firebase-admin');

var serviceAccount = require(process.env.SERVICEACCOUNT);
const { response } = require('../app');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.BUCKETURL,
    databaseURL: process.env.DBURL,
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

async function uploadToAI(url) {
    const fetch = (await import('node-fetch')).default;
    const gcfURL = process.env.GCFURL;

    try {
        const response = await fetch(gcfURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log(data.result);
        return data.result;
    } catch (error) {
        console.error('Error calling Cloud Function:', error);
        throw new Error('Failed to call Cloud Function');
    }
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
        if (error)
            console.error('Error adding user with custom title:', error);
    });
    res.send(result);
});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'rasberry' });
});

module.exports = router;
