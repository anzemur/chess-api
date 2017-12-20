'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var dataBase = require('./api/models/db');
var routesApi = require('./api/routes/apiRoutes');
var app = express();
var player = require('./api/models/playerModel');
var status = require('./api/models/chessboardModel');
var port = process.env.PORT || 3000;


// var server = app.listen(3000, function () {
//     var host = server.address().address;
//     host = (host === '::' ? 'localhost' : host);
//     var port = server.address().port;
//
//     console.log('Listening at: http://%s:%s', host, port);
//
// });




app.get('/', function (req, res) {
  res.send('<!DOCTYPE html><html><body style="background-color:gray;"><h1 style="text-align:center;">Up and running.</h1></body></html>');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routesApi(app);

app.listen(port);
console.log("Up and running on port: " + port);







/** Error handling **/

app.use(function(req, res) {
  res.status(404).send({error: 'Url not found!', url: req.originalUrl})

});
