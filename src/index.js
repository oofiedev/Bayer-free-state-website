require('dotenv').config();
const express = require('express');
const fs = require('fs');
var app = express();

const port = process.env.listenPort || 8080;

/**
 * Render template and serve html files
 * @param {String} fName Local file name
 * @param {Function} callback Callback. Params: (data, err)
 */
function serveFile(fName, callback) {
    fs.readFile(fName, 'utf8', (err, data) => {
        if (err) {
            callback(null, err);
            return;
        }
        let req = data.match(/{{(.*?)}}/g);
        if (!req) {
            callback(data);
            return;
        }
        let count = req.length;
        for (let name of req) {
            name = name.substr(2, name.length - 4);
            fs.readFile('./root/comp/' + name, 'utf8', (err, dat) => {
                if (err) {
                    console.warn(err);
                }
                data = data.replace(/{{(.*?)}}/g, dat);
                count--;
                if (!count) callback(data);
            });
        }
    });
}

app.get('/', (req, res) => {
    serveFile('./page/doc/constitution.html', (data) => {
        res.send(data);
    });
});

app.post('/API/*', (req, res) => {});

app.use('/public', express.static('root/public'));

app.get('/:name', (req, res) => {
    // pages (no .html)
    serveFile('./root/pages/' + req.params.name + '.html', (data, err) => {
        if (err) {
            res.redirect('/404');
            return;
        }
        res.send(data);
    });
});

app.listen(port, () => {
    console.warn(`Listening at port ${port}.`);
});
