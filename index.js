'use strict';

const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const opener = require('opener');
const config = require('./lib/config');
const getAccessToken = require('./lib/get-access-token');
const getItems = require('./lib/get-items');
const sprintf = require('sprintf-js').sprintf;

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
    const time = i.word_count / 275;
    const duration = sprintf('%2u', time);
    return {
      name: `${duration} minutes - ${i.resolved_title}` || 'no title',
      value: i.item_id
    };
  });

  const i = yield inquirer.prompt([
    {type: 'list', name: 'titles', message: 'pick an item', choices: titles, pageSize: 30}
  ]);

  console.log(i);

  const item = items.find((it) => {
    return it.item_id === i.titles;
  });

  console.log(item);

  opener(`https://getpocket.com/a/read/${item.item_id}`);
})();
