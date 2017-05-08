'use strict';

var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var bodyParser = require('body-parser');
var customApp = require('./app/index');

var app = express();
app.use(bodyParser.json());

var port = 4444;


app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');


app.use('/', express.static('static'));



app.get('/', function (req, res) {
    res.render('home');

});
app.get('/about', function (req, res) {
    res.render('about');
});

app.get('/sendPush', function (req, res) {
    res.render('sendPush', {
        sendPush: true
    });
});

app.post('/sendPush', function (req, res) {
    customApp.customAuth.sendPush(req.body).then(function (response) {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            data: {
                id: 'push-request-accepted',
                message: 'Your push will send now'
            }
        }));
    }).catch(function (err) {
        res.status(400);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            data: {
                id: 'some-thing-went-wrong',
                message: 'we are looking in to it',
                error:error
            }
        }));
    });

});

app.get('/auth', function (req, res) {
    customApp.customAuth.getToken().then(function (token) {
        res.send({
            token: token
        });
    });
});

app.get('/offline', function (req, res) {
    res.render('offline');
});

app.listen(port, function () {
    console.log('app at port:- ' + port);
});