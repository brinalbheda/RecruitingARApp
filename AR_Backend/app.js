var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var indexRouter = require('./index');
var app = express();
const request = require('request');
const clientId = "";
const clientSecret = "";
const azureKey = "";
var Linkedin = require('node-linkedin')(clientId, clientSecret);
const params = {
	'returnFaceId': 'true'
};
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


app.get('/oauth/linkedin', function (req, res) {
	var scope = ['r_basicprofile', 'r_emailaddress'];
	Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/oauth/linkedin/callback?userurl=' + req.query.userurl);
	Linkedin.auth.authorize(res, scope, state);
});

app.get('/oauth/linkedin/callback', function (req, res) {
	if (req.query.state == state) {
		Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function (err, results) {
			if (err)
				return console.error(err);
			var linkedinInstance = Linkedin.init(results.access_token, {
				timeout: 10000
			});
			linkedinInstance.people.url(req.query.userurl, ['id', 'first-name', 'last-name', 'summary', 'industry', 'specialties', 'positions'], function (err, $in) {
				console.log($in);
				res.send($in);
				if (err) {
					res.send("error");
				}
			});
		});
	} else {
		return res.redirect('/');
	}
});

app.get('/detect', function (req, resp) {
	// sample photo url : "https://arvrbucket2018.s3.us-west-1.amazonaws.com/testUpload.jpg"
	var detectUrl = "https://westus.api.cognitive.microsoft.com/face/v1.0/detect";
	var detectBody = {
		"url": decodeURIComponent(req.query.photoUrl)
	};
	var options = {
		uri: detectUrl,
		qs: params,
		body: JSON.stringify(detectBody),
		headers: {
			'Content-Type': 'application/json',
			'Ocp-Apim-Subscription-Key': azureKey
		}
	};
	request.post(options, (error, response, body) => {
		if (error) {
			console.log('Error:', error);
			resp.send("Error: Person not registered on the app. ");
		}
		let jsonResponse = JSON.parse(body);
		console.log('JSON Response from Detect api\n');
		console.log(jsonResponse);
		resp.redirect('/identify?faceId=' + jsonResponse[0].faceId);
	});
});

app.get('/identify', function (req, resp) {
	var identifyUrl = "https://westus.api.cognitive.microsoft.com/face/v1.0/identify";
	var identifyBody = {
		"faceIds": [req.query.faceId],
		"personGroupId": "linkedinproject007"
	};
	var options = {
		uri: identifyUrl,
		body: JSON.stringify(identifyBody),
		headers: {
			"Content-Type": "application/json",
			"Ocp-Apim-Subscription-Key": azureKey
		}
	};
	request.post(options, (error, response, body) => {
		if (error) {
			console.log('Error:', error);
			resp.send("Error: Person not registered on the app. ");
		}
		let jsonResponse = JSON.parse(body);
		console.log('JSON Response from identify\n');
		console.log(jsonResponse);
		var userUrl = getPublicUrl(jsonResponse[0].candidates[0].personId);
		resp.redirect('/oauth/linkedin?userurl=' + encodeURIComponent(userUrl));
	});
});

app.get('/data', function (req, resp) {
	/**
	 * @Varun make changes in this function to manipulate photo url
	 * Sample call is: 127.0.0.1:8095/data or localhost:8095/data
	 * Currently it will give your details as your photo url is hardcoded
	 */

	var photoUrl = "https://arvrbucket2018.s3.us-west-1.amazonaws.com/testUpload.jpg";
	resp.redirect('/detect?photoUrl=' + encodeURIComponent(photoUrl));
});

var personDictionary = {
	"af7e6fce-32f8-46b2-aaff-0a55be8c0f90": {
		name: "Dhanashri Tidke",
		userUrl: "https://www.linkedin.com/in/dhanashritidke/"
	},
	"a107e2d9-ceb0-43cf-8a7f-85903c961efb": {
		name: "Divyata Singh",
		userUrl: "https://www.linkedin.com/in/divyata-singh/",
	},
	"12e2274e-e666-4658-9051-f24783a01cdc": {
		name: "Dhruv Bajpai",
		userUrl: "https://www.linkedin.com/in/dhruv-bajpai/"
	},
	"385d778a-e724-4dba-a536-6fe5336b3740": {
		name: "Brinal Bheda",
		userUrl: "https://www.linkedin.com/in/brinalbheda/"
	},
	"132e763e-16fa-4f71-9950-893543cae7aa": {
		name: "Shivi Verma",
		userUrl: "https://www.linkedin.com/in/shivi-verma-a52574114/"
	},
	"2d4a5bcc-766c-4093-8a24-2fb7cf0e57fa": {
		name: "Anandi Bharwani",
		userUrl: "https://www.linkedin.com/in/anandi-bharwani-873205a1/"
	},
	"8b0f736b-c16a-447b-812b-9a0ff938b15b": {
		name: "Varun Manocha",
		userUrl: "https://www.linkedin.com/in/manochav/"
	}
};

function getPublicUrl(id) {
	var userUrl = personDictionary[id].userUrl;
	console.log("\nName is:" + personDictionary[id].name);
	console.log("\nLinkedIn Url is:" + personDictionary[id].userUrl);
	return userUrl;
}


var port = process.env.PORT || 8095;
app.listen(port, function () {
	console.log("Server started on port " + port);
});
