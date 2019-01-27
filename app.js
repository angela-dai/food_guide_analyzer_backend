const fs = require('fs');
const express = require('express');
const formidable = require('formidable');
const bodyParser = require('body-parser');
const request = require('request');

const secure_keys = require('./secure_keys.json');

const app = express();
const port = 3001;

function postToAzure(path, res) {
    request({
        url: 'http://canadacentral.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Tags',
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': secure_keys.key1,
        },
        encoding: null,
        body: fs.createReadStream(path)
    }, (error, response, body) => {
        if (error) {
            response.json({name : error});
        } else {
            //
            console.log(response.toString('utf8'));
            console.log(body.toString('utf8'));
            res.send(body)
        }
    });
}

app.get('/', (req, res) => res.send('Hello World!'))

<<<<<<< HEAD
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/submission', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        console.log('Got a form!');
        if(err){
            console.error('Error', err);
        }
        console.log('Fields', fields);
        console.log('Files', files);
        console.log(files.image.path);
        postToAzure(files.image.path, res);
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
    console.log(`Using key ${secure_keys.key1}!`);
});
=======
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

function processPhotoTags(jsonPhotoTags) {
  var size = jsonPhotoTags['tags'].length;
  var tags = [];
  for (var i = 0; i < size; i++) {
    tags.push(jsonPhotoTags['tags'][i]);
  }
  return tags;
}

function foodGroupsTrend(sqlResponseData) {
  // get proportion of each, month, day
  var currMonth = 0;
  var currDay = 0;
  var currVeg = 0;
  var currPro = 0;
  var currCounter = 0;
  var currGrain = 0;
  var resultVeg = {};
  var resultPro = {};
  var resultGrain = {};
  sqlResponseData.foreach(function(row)) {
    if (row.month === currMonth && row.day === currDay) {
      currPro += row.protein;
      currVeg += row.vegtable;
      currGrain += row.grain;
      currCounter ++;
    } else {
      resultVeg.push({month : currMonth, day : currDay, avg : currVeg/currCounter});
      resultPro.push({month : currMonth, day : currDay, avg : currPro/currCounter});
      resultGrain.push({month : currMonth, day : currDay, avg : currGrain/currCounter});
      currMonth = row.month;
      currDay = row.day;
      currPro = row.protein;
      currVeg = row.vegtable;
      currGrain = row.grain;
      currCounter = 1;
    }
  }
  resultVeg.push({month : currMonth, day : currDay, avg : currVeg/currCounter});
  resultPro.push({month : currMonth, day : currDay, avg : currPro/currCounter});
  resultGrain.push({month : currMonth, day : currDay, avg : currGrain/currCounter});

  var result = {vegetable: resultVeg, protein: resultPro, grain: resultGrain};
  return JSON.stringify(result);
}
>>>>>>> yutian
