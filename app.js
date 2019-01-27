const fs = require('fs');
const express = require('express');
const cors = require('cors');
const formidable = require('formidable');
const bodyParser = require('body-parser');
const request = require('request');

const secure_keys = require('./secure_keys.json');
const config = require('./config.json');

const app = express();
const port = config.port;

function getFilterList() {
    file = fs.readFileSync('./filter_foods');
    return file.toString().split(/\r?\n/);
}

filterList = getFilterList();
filterList.pop();
filterList.forEach(word => console.log(word));

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
            console.log(response.toString('utf8'));
            console.log(body.toString('utf8'));
            try {
                tags = JSON.parse(body)
                    .tags
                    .map(data => data.name)
                    .filter(word => {
                        return filterList.some(filterWord => {
                            if(filterWord.includes(word) || word.includes(filterWord)) {
                                console.log(`${word} matches ${filterWord}`);
                                return true;
                            }
                            return false;
                        });
                    });

                console.log(tags);
                res.send(JSON.stringify({"tags": tags}));
            } catch(err) {
                console.log(err);
                res.send(JSON.stringify({"err": err.toString()}));
            }
        }
    });
}

app.get('/', (req, res) => res.send('Hello World!'))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

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
