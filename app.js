const express = require('express')
const app = express()
const port = 3001

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
