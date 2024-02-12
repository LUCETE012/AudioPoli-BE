var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var {Storage} = require('@google-cloud/storage');

var admin = require('firebase-admin');

// global.serviceAccount = require('../audiopoli-28904-firebase-adminsdk-t43gt-10e01b1c11.json');
var serviceAccount = require('../audiopoli-6b817-firebase-adminsdk-qqe2o-cc608bd744.json');

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

// // multer 설정: 오디오 파일을 디스크에 저장
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/')  // 'uploads/'는 파일을 저장할 디렉토리
//     },
//     filename: function (req, file, cb) {
//         // 클라이언트에서 보낸 파일 이름을 사용
//         cb(null, file.originalname)
//     }
// });

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

// const upload = multer({ storage: storage });

router.post('/', upload.single('sound'), async (req, res) => {
    try {
        var result = {
            id: req.body.id,
            date: req.body.date,
            time: req.body.time,
            latitude: req.body.latitude,
            longtitude: req.body.longtitude,
            sound: null,
            detail: null,
            category: null,
            isCrime: null
        };

        if (!req.file) {
            throw new Error('File is not provided');
        }

        const file = bucket.file(req.file.originalname);
        const stream = file.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });
      
        stream.on('error', (error) => res.status(500).send(error));
      
        stream.on('finish', async () => {
            // 업로드된 파일의 공개 URL을 설정합니다.
            await file.makePublic();

            // 업로드된 파일의 URL을 가져옵니다.
            result.sound = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            console.log(result.sound);
            result.detail = AI_result;
            result.category = detailToCategory(AI_result);
            result.isCrime = false;

            console.log(result);
            // 파일 로컬 저장 위치와 이름
            // const filePath = path.join(__dirname, 'uploads', req.file.originalname);
            // res.send(`File saved successfully at ${filePath}`);

            userRef.push(result, (error) => {
                if (error) {
                    console.error('Error adding user:', error);
                } else {
                    console.log('User added successfully!');
                }
            });
        });
        stream.end(req.file.buffer);
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while processing your request.");
    }
});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'rasberry' });
});

module.exports = router;
