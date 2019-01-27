const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001

app.get('/', (req, res) => res.send('Hello World!'))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/submission', (req, res) => {
    var img = req.body.img;
    if(!img) {
        res.send('Error, no data');
    } else {
        res.send(img);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
