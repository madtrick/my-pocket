'use strict';

const r = require('request-promise');
const Bluebird = require('bluebird');

const BASE_URL = 'https://getpocket.com/v3';

module.exports = function archiveItem (config, itemId) {
  return Bluebird.resolve();
  // return r.post({
  //   uri: `${BASE_URL}/send.php`,
  //   headers: {
  //     'Content-Type': 'application/json; charset=UTF8',
  //     'X-Accept': 'application/json',
  //   },
  //   body: {
  //     consumer_key: config.consumer_key,
  //     access_token: config.access_token,
  //     actions: [
  //       {
  //         action: 'archive',
  //         itemId,
  //       },
  //     ],
  //   },
  //   json: true,
  // });
};
