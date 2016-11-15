'use strict';

const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const opener = require('opener');
const config = require('./lib/config');
const getAccessToken = require('./lib/get-access-token');
const getItems = require('./lib/get-items');

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

  const items = yield getItems(c);

  const titles = items.map((i) => {
    return i.resolved_title || 'no title';
  });

  const i = yield inquirer.prompt([
    {type: 'list', name: 'titles', message: 'pick an item', choices: titles, pageSize: 30}
  ]);

  const item = items.find((it) => {
    return it.resolved_title === i.titles;
  });

  console.log(item);

  opener(`https://getpocket.com/a/read/${item.item_id}`);
})();
