'use strict';

// auto build based on Travis
// additional settings in .travis.yml

// server build-notification
// usage: node build.js BRANCH_NAME

var express = require('express');
var http = require('http');
var https = require('https');
var parser = require('body-parser');
var _ = require('lodash');
var fs = require('fs');
var exec = require('child_process').exec;

var URL = '/build-notifications';
var BRANCH = process.argv[2] || 'development';
var CMDLINE = 'git checkout ' + BRANCH + ' && git pull && npm run build';

console.log(`Using branch ${BRANCH} for deployment`);

var app = express();
app.use(parser.json());
app.use(parser.urlencoded({
  extended: true
}));

// var options = {
//   key: fs.readFileSync('./key.pem'),
//   cert: fs.readFileSync('./cert.pem')
// };

app.post(URL, function (req, res) {
  if (!_.has(req, 'body') && !_.has(req.body, 'payload')) return res.writeHead(500);
  var body = JSON.parse(req.body.payload);
  if (_.has(body, 'status_message') && body.status_message === 'Passed') {
    console.log(`Commit: ${body.commit} by ${body.committer_name} at ${body.committed_at}`);
    console.log(`Message: ${body.message}`);
    console.log(`Executing: ${CMDLINE}`);
    exec(CMDLINE);
  }
  res.writeHead(200);
  res.end();
});

app.listen(6712, () => { console.log('Listening for Travis on port 6712'); }); // traffic proxied through NGINX
