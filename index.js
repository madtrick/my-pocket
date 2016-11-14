'use strict';

const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const config = require('./lib/config');
const getAccessToken = require('./lib/get-access-token')

const co = Bluebird.coroutine;

co(function * () {
  let c;

  try {
    c = yield config.read();
  } catch (e) {
    if (e.code === 'ENOENT') {
      c = yield config.init();
    }
  }

  if (!c.consumer_key) {
    const response = yield inquirer.prompt([
      { type: 'input', name: 'consumer_key', message: `What's your consumer key?` }
    ]);

    c.consumer_key = response.consumer_key;
    yield config.write(c);
  }

  if (!c.access_token) {
    const response = yield getAccessToken(c);

    c.access_token = response.access_token;
    yield config.write(c);
  }
})();
