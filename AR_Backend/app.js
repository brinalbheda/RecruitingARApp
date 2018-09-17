var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var indexRouter = require('./index');
var app = express();
const clientId = "";
const clientSecret = "";
var Linkedin = require('node-linkedin')(clientId, clientSecret);
const state = "ar4567";
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', indexRouter);

// app.post('/oauth/linkedin', function (req, res) {
//     var userurl = req.body.userurl;
//     var scope = ['r_basicprofile', 'r_emailaddress'];
//     Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/oauth/linkedin/callback?userurl=' + encodeURI(userurl));
//     Linkedin.auth.authorize(res, scope, state);
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

var port = process.env.PORT || 8095;
app.listen(port, function () {
    console.log("Server started on port " + port);
});
