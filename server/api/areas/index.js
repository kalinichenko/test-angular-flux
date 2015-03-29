'use strict';
var fs = require('fs');

var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
  var areas = JSON.parse(fs.readFileSync(__dirname + '/areas.json', 'utf8'));
  res.json(areas);
});

router.post('/', function(req, res) {
  res.json(req.body);
});

module.exports = router;
