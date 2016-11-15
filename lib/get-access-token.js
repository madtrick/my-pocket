'use strict';

const r = require('request-promise');
const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const express = require('express')
const opener = require('opener');

const app = express()

app.get('/', function (req, res) {
  console.log(req.body);
  res.send('');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

const co = Bluebird.coroutine;
const BASE_URL = 'https://getpocket.com/v3';

module.exports = co(function * (config) {
  const code = yield r.post({
    uri: `${BASE_URL}/oauth/request.php`,
    headers: {
      'Content-Type': 'application/json; charset=UTF8',
      'X-Accept': 'application/json'
    },
    body: {
      consumer_key: config.consumer_key,
      redirect_uri: 'lol:authorizationFinished'
    },
    json: true
  });

  const url = `https://getpocket.com/auth/authorize?request_token=${code.code}&redirect_uri=${encodeURIComponent('http://localhost:3000')}`;

  opener(url);

  yield inquirer.prompt([
    { type: 'confirm', name: 'continue', message: 'continue?' }
  ]);

  try {
    const rs = yield r.post({
      uri: `${BASE_URL}/oauth/authorize.php`,
      headers: {
        'Content-Type': 'application/json; charset=UTF8',
        'X-Accept': 'application/json'
      },
      body: {
        consumer_key: config.consumer_key,
        code: code.code
      },
      json: true
    });

    console.log(rs);
    return rs;
  } catch (e) {
    console.log(e);
  }
});
