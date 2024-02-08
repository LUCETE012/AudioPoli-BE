var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');

// multer 설정: 오디오 파일을 디스크에 저장
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')  // 'uploads/'는 파일을 저장할 디렉토리
    },
    filename: function (req, file, cb) {
        // 클라이언트에서 보낸 파일 이름을 사용
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('sound'), (req, res) => {
    console.log("here");
    try {
        // 추가 데이터 처리 (예: id, date, time, latitude, longtitude)
        const id = req.body.id;
        const date = req.body.date;
        const time = req.body.time;
        const latitude = req.body.latitude;
        const longtitude = req.body.longtitude;

        if (!req.file) {
            throw new Error('File is not provided');
        }

        // 파일 저장 위치와 이름
        const filePath = path.join(__dirname, 'uploads', req.file.originalname);
        
        res.send(`File saved successfully at ${filePath}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while processing your request.");
    }
});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'rasberry' });
});

module.exports = router;
