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


app.post('/postreq', upload.single('image'), function (req, res, next) {
    console.log(req.body)
    var base64Data = req.body.base64string;
    require("fs").writeFile("out.jpg", base64Data, 'base64', function(err) {
        console.log(err);
    });
})

app.listen(port);
console.log('Listen on port ' + port);