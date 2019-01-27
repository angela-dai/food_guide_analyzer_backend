const fs = require('fs');
const express = require('express');
const formidable = require('formidable');
const bodyParser = require('body-parser');
const request = require('request');

const secure_keys = require('./secure_keys.json');

const app = express();
const port = 3001;

const Promise = require('bluebird')
const AppDAO = require('./dao')
const AssociationsRepository = require('./associations_repository')
const MainRepository = require('./main_repository')
const TagsRepository = require('./tags_repository')

const dao = new AppDAO('./database.sqlite3')
const assocRepo = new AssociationsRepository(dao)
const mainRepo = new MainRepository(dao)
const tagsRepo = new TagsRepository(dao)

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

function processPhotoTags(jsonPhotoTags) {
  var size = jsonPhotoTags['tags'].length;
  var tags = [];
  for (var i = 0; i < size; i++) {
    tags.push(jsonPhotoTags['tags'][i]);
  }
  return tags;
}
// is this the all the tags? I'll use them to add into database


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

function submitPhoto(protein, vegetable, grain, tags) {
  var today = new Date();
  var month = today.getMonth();
  var day = today.getDate();

  mainRepo.createTable()
    .then(() => assocRepo.createTable())
    .then(() => projectRepo.create(month, day, protein, vegetable, grain))
    .then((data) => {
      mainId = data.id
      var promises = [];
      tags.forEach(tag => {
        promises.push(assocRepo.create(mainId, tag))
      })
      return Promise.all(promises);
    })
    .catch((err) => {
      console.log('Error: ')
      console.log(JSON.stringify(err))
    })
}

function dailyAnalyzer() {
  mainRepo.createTable()
    .then(() => projectRepo.getAll())
    .then((data) => {
      return foodGroupsTrend(data);
    })
    .catch((err) => {
      console.log('Error: ')
      console.log(JSON.stringify(err))
    })
}
