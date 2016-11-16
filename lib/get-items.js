'use strict';

const Bluebird = require('bluebird');
const r = require('request-promise');
const _ = require('lodash');

const co = Bluebird.coroutine;
const BASE_URL = 'https://getpocket.com/v3';

module.exports = co(function * (config, tag) {
  const response = yield r.post({
    uri: `${BASE_URL}/get.php`,
    headers: {
      'Content-Type': 'application/json; charset=UTF8',
      'X-Accept': 'application/json'
    },
    body: {
      consumer_key: config.consumer_key,
      access_token: config.access_token,
      tag,
      state: 'unread',
      detailType: 'complete'
    },
    json: true
  });

  return _.values(response.list);
});
