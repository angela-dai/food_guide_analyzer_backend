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

function database() {
  const dao = new AppDAO('./database.sqlite3')
  const assocRepo = new AssociationsRepository(dao)
  const mainRepo = new MainRepository(dao)
  const tagsRepo = new TagsRepository(dao)
  let mainId

  mainRepo.createTable()
    .then(() => assocRepo.createTable())
    .then(() => projectRepo.create(blogProjectData.name))
    .then((data) => {
      projectId = data.id
      const tasks = [
        {
          name: 'Outline',
          description: 'High level overview of sections',
          isComplete: 1,
          projectId
        },
        {
          name: 'Write',
          description: 'Write article contents and code examples',
          isComplete: 0,
          projectId
        }
      ]
      return Promise.all(tasks.map((task) => {
        const { name, description, isComplete, projectId } = task
        return taskRepo.create(name, description, isComplete, projectId)
      }))
    })
    .then(() => projectRepo.getById(projectId))
    .then((project) => {
      console.log(`\nRetreived project from database`)
      console.log(`project id = ${project.id}`)
      console.log(`project name = ${project.name}`)
      return projectRepo.getTasks(project.id)
    })
    .then((tasks) => {
      console.log('\nRetrieved project tasks from database')
      return new Promise((resolve, reject) => {
        tasks.forEach((task) => {
          console.log(`task id = ${task.id}`)
          console.log(`task name = ${task.name}`)
          console.log(`task description = ${task.description}`)
          console.log(`task isComplete = ${task.isComplete}`)
          console.log(`task projectId = ${task.projectId}`)
        })
      })
      resolve('success')
    })
    .catch((err) => {
      console.log('Error: ')
      console.log(JSON.stringify(err))
    })
}

database()
