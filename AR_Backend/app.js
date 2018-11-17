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
var AWS = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
AWS.config.loadFromPath('aws.config.json');
var s3 = new AWS.S3();
const access_token = "";
const params = {
	'returnFaceId': 'true'
};
const state = "ar4567";
const errorString = {
	"error": "Person not registered on the app."
};
const linkedInerrorString = {
	"error": "Unable to fetch data from LinkedIn."
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', indexRouter);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true}));


app.get('/oauth/linkedin', function (req, res) {
	var scope = ['r_basicprofile', 'r_emailaddress'];
	Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/oauth/linkedin/callback?userurl=' + req.query.userurl);
	Linkedin.auth.authorize(res, scope, state);
});

app.get('/oauth/linkedin/callback', function (req, res) {
	if (req.query.state == state) {
		Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function (err, results) {
			console.log("\nAccess Token\n" + results.access_token);
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

app.get('/linkedin/profile', function (req, res) {
	var linkedinInstance = Linkedin.init(access_token, {
		timeout: 10000
	});
	linkedinInstance.people.url(req.query.userurl, ['id', 'first-name', 'last-name', 'summary', 'industry', 'specialties', 'positions'], function (err, $in) {
		if (err) {
			res.send(JSON.stringify(linkedInerrorString));
		}
		var id = req.query.personId;
		var details = personDictionary[id];
		var body = $in;
		body.courses = details.courses;
		body.skills = details.skills;
		body.education = details.education;
		body.experience = details.experience;
		console.log("\nLinkedIn Profile Details:\n");
		console.log(body);
		res.send(body);
	});
});

app.get('/detect', function (req, resp) {
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
			console.log('Error in detect:\n', error);
			resp.send(JSON.stringify(errorString));
		}
		let jsonResponse = JSON.parse(body);
		console.log('JSON Response from Detect api\n');
		console.log(jsonResponse);
		var faceIds = [];
		for (var i = 0; i < jsonResponse.length; i++) {
			faceIds.push(jsonResponse[i].faceId);
		}
		resp.redirect('/identify?faceIds=' + faceIds);
	});
});

app.get('/identify', function (req, resp) {
	var identifyUrl = "https://westus.api.cognitive.microsoft.com/face/v1.0/identify";
	var faceIds = req.query.faceIds.split(',');
	var identifyBody = {
		"faceIds": faceIds,
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
			console.log('Error in identify:\n', error);
			resp.send(JSON.stringify(errorString));
		}
		let jsonResponse = JSON.parse(body);
		console.log('JSON Response from identify\n');
		console.log(jsonResponse);
		var personId = getPersonId(jsonResponse);
		if (personId === null) {
			resp.send(JSON.stringify(errorString));
		}
		var userUrl = getPublicUrl(personId);
		resp.redirect('/linkedin/profile?userurl=' + encodeURIComponent(userUrl) + '&personId=' + personId);
	});
});

var upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'arvrbucket2018',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: 'public-read',
		key: function (req, file, cb) {
			cb(null, file.originalname);
		}
	})
});

app.post('/data', upload.single('file'), function (req, res) {
	var currentdate = new Date(); 
	var datetime = "Call sent at: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
	console.log(datetime);
	var photoUrl = req.file.location;
	console.log("\n Photo URL on S3:\n")
	console.log(photoUrl);
	res.redirect('/detect?photoUrl=' + encodeURIComponent(photoUrl));
});

app.post('/postreq', function (req, res) {
	var base64Data = req.body.img;
	var buf = new Buffer(base64Data, 'base64');
        var params = {
            Bucket: 'arvrbucket2018',
            Key: 'upload_image', 
            Body: buf,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: 'image/jpg' 
        }

	var s3Bucket = new AWS.S3();
	
        s3Bucket.upload(params, function(err, data) {
            if (err) {
                return console.log(err)
            }
			console.log('Image successfully uploaded.');
			console.log(data);
			var photoUrl = data.Location;
			console.log("\n Photo URL on S3:\n")
			console.log(photoUrl);
			res.redirect('/detect?photoUrl=' + encodeURIComponent(photoUrl));
		});
})

app.get('/testget', function (req, resp) {
	resp.send("sample response for get");
});
app.post('/testpost', function (req, resp) {
	resp.send("sample response for post:" + req.body.name);
});

var personDictionary = {
	"af7e6fce-32f8-46b2-aaff-0a55be8c0f90": {
		name: "Dhanashri Tidke",
		userUrl: "https://www.linkedin.com/in/dhanashritidke/",
		courses: ["Analysis of Algorithms", "Applied Natural Language Processing", "Augmented, Virtual and Mixed Reality", "Foundations of Artificial Intelligence"],
		skills: ["Java", "Algorithms", "Python", "JavaScript", "MySQL", "C"],
		education: [{
			degree: "Master of Science - MS, Computer Science",
			university: "University of Southern California Viterbi School of Engineering",
			duration: "2018 - 2020"
		}, {
			degree: "Bachelor of Technology - BTech, Computer Science",
			university: "Vishwakarma Institute Of Technology",
			duration: "2011 - 2015"
		}],
		experience: [{
			position: "Summer Intern",
			company: "Information Sciences Institute",
			duration: "May 2018 - Present"
		},
		{
			position: "Software Engineer",
			company: "eQ Technologic",
			duration: "Jul 2015 - Dec 2017"
		}]
	},
	"a107e2d9-ceb0-43cf-8a7f-85903c961efb": {
		name: "Divyata Singh",
		userUrl: "https://www.linkedin.com/in/divyata-singh/",
		courses: ["Analysis of Algorithms", "Foundations of Artificial Intelligence", "Applied Natural Language Processing", "Augmented, Virtual and Mixed Reality", "Web Technologies", "Information Retrieval and Web Search Engines"],
		skills: ["AngularJS", "Java", "JavaScript", "Scrum", "Node.js", "Python", "Amazon Web Services(AWS)", "MySQL", "C#", "MongoDB"],
		education: [{
			degree: "Master of Science - MS, Computer Science",
			university: "University of Southern California",
			duration: "2017 - 2019"
		}, {
			degree: "Bachelor of Technology - BTech, Computer Science and Engineering",
			university: "Vellore Institute Of Technology",
			duration: "2011 - 2015"
		}],
		experience: [{
			position: "Web Developer",
			company: "Information Sciences Institute",
			duration: "May 2018 - Present"
		},
		{
			position: "Software Engineer",
			company: "Schlumberger",
			duration: "Jul 2015 - Jul 2017"
		}]
	},
	"12e2274e-e666-4658-9051-f24783a01cdc": {
		name: "Dhruv Bajpai",
		userUrl: "https://www.linkedin.com/in/dhruv-bajpai/",
		courses: ["Analysis of Algorithms", "Foundations of Artificial Intelligence", "Applied Natural Language Processing", "Augmented, Virtual and Mixed Reality", "Machine Learning", "Database Systems"],
		skills: ["Programming", "Android Development", "Visual Basic", "Java", "C++", "C", "JavaScript", "PHP", "MySQL", "HTML", "Matlab"],
		education: [{
			degree: "Master of Science - MS, Computer Science",
			university: "University of Southern California",
			duration: "2017 - 2019"
		}, {
			degree: "B.Tech, Computer Engineering",
			university: "University School of Information Technology",
			duration: "2012 - 2016"
		}],
		experience: [{
			position: "Software Development Intern",
			company: "Expedia Group",
			duration: "May 2018 - Aug 2018"
		},
		{
			position: "Technical Specialist",
			company: "Mindtree",
			duration: "Jul 2016 - Jul 2017"
		}]
	},
	"385d778a-e724-4dba-a536-6fe5336b3740": {
		name: "Brinal Bheda",
		userUrl: "https://www.linkedin.com/in/brinalbheda/",
		courses: ["Advanced Mobile Devices and Game Consoles", "Computer Networks", "Digital Signal Processing", "Internet and Cloud Computing"],
		skills: ["Python", "C++", "C", "Matlab", "Java"],
		education: [{
			degree: "Master of Science - MS, Electrical Engineering-Multimedia and Creative",
			university: "University Of Southern California",
			duration: "2017-2019"
		}, {
			degree: "Bachelor Of Engineering(BE), Electrionics and Telecommunication",
			university: "Dwarkadas J. Sanghvi College of Engineering",
			duration: "2013-2017"
		}],
		experience: [{
			position: "Graduate Research Assistant",
			company: "University Of Southern California",
			duration: "May 2018-Aug 2018"
		},
		{
			position: "Human Resources And Development Chairperson",
			company: "Rotaract Club of King's Circle, Matunga",
			duration: "Jun 2016 - Jul 2017"
		}]
	},
	"132e763e-16fa-4f71-9950-893543cae7aa": {
		name: "Shivi Verma",
		userUrl: "https://www.linkedin.com/in/shivi-verma-a52574114/",
		courses: ["OS", "AR/VR", "Algorithms", "Web technologies"],
		skills: ["C++", "PHP", "JavaScript", "Node.js", "Core Java", "HTML"],
		education: [{
			degree: "Master's Degree, Computer Science",
			university: "University Of Southern California",
			duration: "2017-2109"
		}, {
			degree: "Bachelor Of Technology(B.tech.), Information Technology",
			university: "Maharaja Surajmal Institute Of Technology",
			duration: "2013-2017"
		}],
		experience: [{
			position: "Software Engineering Intern",
			company: "Viasat Inc.",
			duration: "May 2018 - Aug 2018"
		},
		{
			position: "Intern (SAP MM)",
			company: "BSES Delhi",
			duration: "Jul 2016 - Aug 2016"
		}]
	},
	"2d4a5bcc-766c-4093-8a24-2fb7cf0e57fa": {
		name: "Anandi Bharwani",
		userUrl: "https://www.linkedin.com/in/anandi-bharwani-873205a1/",
		courses: ["AR/VR", "OS", "Web Technologies", "Algorithms"],
		skills: ["C++", "Python", "Linux", "SQL"],
		education: [{
			degree: "Master's Of Science - MS,Computer Science",
			university: "University Of Southern California",
			duration: "2017-2019"
		}, {
			degree: "Bachelor Of Technology - Btech,Computer Science",
			university: "National Institute Of Technology Durgapur",
			duration: "2011-2015"
		}],
		experience: [{
			position: "Deep Learning Architect Intern",
			company: "NVIDIA",
			duration: "Jun 2018 - Aug 2018"
		},
		{
			position: "Software Engineer I",
			company: "Micro Focus",
			duration: "Jul 2015 - Jun 2017"
		}]
	},
	"8b0f736b-c16a-447b-812b-9a0ff938b15b": {
		name: "Varun Manocha",
		userUrl: "https://www.linkedin.com/in/manochav/",
		courses: ["Algorithms", "Web technologies", "Database Systems", "AR/VR"],
		skills: ["Python", "C++", "Django"],
		education: [{
			degree: "Master's Degree, Computer Science",
			university: "University Of Southern California",
			duration: "2017-2019"
		}, {
			degree: "Bachelor's Degree, Computer Science",
			university: "Vellore Institue Of Technology",
			duration: "2013-2017"
		}],
		experience: [{
			position: "Software Engeering Intern",
			company: "Viasat Inc.",
			duration: "May 2018 - Aug 2018"
		},
		{
			position: "Intern As Software Developer",
			company: "Ecom Express Pvt. Ltd.",
			duration: "Dec 2016 - May 2017"
		}]
	}
};

function getPublicUrl(id) {
	var userUrl = personDictionary[id].userUrl;
	console.log("\nName is: " + personDictionary[id].name);
	console.log("\nLinkedIn Url is: " + personDictionary[id].userUrl);
	return userUrl;
}
/**
 * Returns person Id of person with highest confidence factor
 * @param {*} identifyResponse: Response from Azure's face identify API call  
 */
function getPersonId(identifyResponse) {
	var personId = [];
	var confidence = []; 
	for (var i = 0; i < identifyResponse.length; i++) {
		if (identifyResponse[i].candidates.length > 0) {
			personId.push(identifyResponse[i].candidates[0].personId);
			confidence.push(identifyResponse[i].candidates[0].confidence);
		}
	}
	var maxConfidence = -1;
	var maxConfidenceIndex = -1;
	for (var i = 0; i < confidence.length; i++) {
		if (confidence[i] > maxConfidence) {
			maxConfidence = confidence[i];
			maxConfidenceIndex = i;
		}
	}
	if (maxConfidenceIndex == -1) {
		return null;
	} else {
		return personId[maxConfidenceIndex];
	}
}


var port = process.env.PORT || 8002;
app.listen(port, function () {
	console.log("Server started on port " + port);
});
