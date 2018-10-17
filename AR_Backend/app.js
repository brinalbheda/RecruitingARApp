var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var fs = require('fs');
var indexRouter = require('./index');
var app = express();
const clientId = "86p85uumtd4tli";
const clientSecret = "8wbzpsbzHDrTIkXJ";
var Linkedin = require('node-linkedin')(clientId, clientSecret);
var AWS = require('aws-sdk');
var multer = require('multer');
var multerS3  = require('multer-s3');
AWS.config.loadFromPath('aws.config.json');
var s3 = new AWS.S3();


const state = "ar4567";
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use('/', indexRouter);

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'arvrbucket2018',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname); //use Date.now() for unique file keys
        }
    })
});
app.post('/uploadPost', upload.single('file'), function (req, res, next) {
    var file = req.file;
    res.send(req.file.location);

})

// app.post('/uploadPost', function (req, res) {
//     console.log(req.body)
//     res.send("you will get this response");
    
//     // var userurl = req.body.userurl;
//     // var scope = ['r_basicprofile', 'r_emailaddress'];
//     // Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/oauth/linkedin/callback?userurl=' + encodeURI(userurl));
//     // Linkedin.auth.authorize(res, scope, state);
// });

app.get('/oauth/linkedin', function (req, res) {
    var scope = ['r_basicprofile', 'r_emailaddress'];
    Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/oauth/linkedin/callback?userurl=' +  req.query.userurl);
    Linkedin.auth.authorize(res, scope, state);
});

app.get('/oauth/linkedin/callback', function (req, res) {
    if (req.query.state == state) {
        Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function (err, results) {
            if (err)
                return console.error(err);
            console.log(results);
            var linkedinInstance = Linkedin.init(results.access_token, {
                timeout: 10000
            });
            console.log("\nUser ID: " + req.query.userid + "\n");
            console.log("User URL="+ req.query.userurl);
            // linkedinInstance.people.me(['id', 'first-name', 'last-name'],function(err, $in) {
            //     console.log($in);
            // });
            // linkedinInstance.people.id(req.query.userid,['id', 'first-name', 'last-name'], function (err, $in) {
            //     console.log($in);
            //     res.send($in);
            //     if(err){
            //         res.send("error"); 
            //     }
            // });
            linkedinInstance.people.url(req.query.userurl,['id', 'first-name', 'last-name','summary'], function (err, $in) {
                console.log($in);
                res.send($in);
                if(err){
                    res.send("error"); 
                }
            });
        });
    } else {
        return res.redirect('/');
    }
});
app.get('/upload', function (req, res) {
    var s3Bucket = new AWS.S3()
    fs.readFile("test.JPG", function(err, file_buffer){
        var params = {
            Bucket: 'arvrbucket2018',
            Key: 'testUpload.jpg',
            Body: file_buffer,
            ACL: 'public-read'
        };
    s3Bucket.upload(params, function(err, data) {
      if (err) {
        return alert('There was an error uploading your photo: ', err.message);
      }
    res.send(data);
    });
    });
});

var port = process.env.PORT || 8095;
app.listen(port, function () {
    console.log("Server started on port " + port);
});
