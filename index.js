'use strict';

var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
var customApp = require('./app/index');

var app = express();
app.use(bodyParser.json());

var port = 4444;

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', 'hbs');


app.use('/', express.static('static'));



app.get('/', function (req, res) {
    res.render('home');

});
app.get('/about', function (req, res) {
    res.render('about');
});
app.get('/auth',function(req,res){
    customApp.customAuth.getToken().then(function(token){
        res.send({token:token});
    });
});

app.get('/offline', function (req, res) {
    res.render('offline');
});

app.listen(port, function () {
    console.log('app at port:- ' + port);
});

