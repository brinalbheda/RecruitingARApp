// server.js

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var morgan       = require('morgan');
var bodyParser   = require('body-parser');
var multer = require('multer');
var upload = multer({ dest: '/home/dhanashri/Desktop/upload/' });

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json({limit: '50mb'})); // get information from html forms
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.post('/postreq', function (req, res) {
    console.log(req.body)
    var base64Data = req.body.base64string;
    console.log(base64Data);
    require("fs").writeFile("out.jpg", base64Data, 'base64', function(err) {
        console.log(err);
    });
    // Generally we'd have a userId associated with the image
    // For this example, we'll simulate one
        var userId = 1;

    // With this setup, each time your user uploads an image, will be overwritten.
    // To prevent this, use a unique Key each time.
    // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
        var params = {
            //Bucket: process.env.s3_BUCKET,
            Key: '${userId}', // type is not required
            Body: base64Data,
            ACL: 'public-read',
            ContentEncoding: 'base64', // required
            ContentType: 'image/jpg' // required. Notice the back ticks
        }

    var s3Bucket = new AWS.S3({ params: { Bucket: 'arvrbucket2018' } });

    // The upload() is used instead of putObject() as we'd need the location url and assign that to our user profile/database
    // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
        s3Bucket.upload(params, function(err, data) {
            if (err) {
                return console.log(err)
            }

            // Continue if no error
            // Save data.Location in your database
            console.log('Image successfully uploaded.');
        });
})


app.listen(port);
console.log('Listen on port ' + port);
