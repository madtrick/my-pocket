'use strict';

const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const opener = require('opener');
const moment = require('moment');
const sprintf = require('sprintf-js').sprintf;
const Config = require('./lib/config');
const getAccessToken = require('./lib/get-access-token');
const getItems = require('./lib/get-items');
const archiveItem = require('./lib/archive-item');

const co = Bluebird.coroutine;
let tag;

if (process.argv.length > 2 && process.argv[2] === '-t' && process.argv[3]) {
  tag = process.argv[3];
}

if (process.argv.length > 2 && process.argv[2] === '--no-tag') {
  tag = '_untagged_';
}

function offset (items, item) {
  const index = items.findIndex(i => i === item);

  const head = items.slice(0, index + 1);
  const tail = items.slice(index + 1);

  return tail.concat(head);
}

function show (config, items) {
  co(function* coshow () {
    const titles = items.map((i) => {
      const time = i.word_count / 275;
      const duration = sprintf('%2u', time);
      const tags = Object.keys(i.tags || {});
      const age = sprintf('%9s', moment(i.time_added * 1000).fromNow(true));

      return {
        name: `${age} - ${duration} minutes - [${tags}] - ${i.resolved_title}` || 'no title',
        value: i.item_id,
      };
    });

    const i = yield inquirer.prompt([
      { type: 'list', name: 'titles', message: 'pick an item', choices: titles, pageSize: 30 },
    ]);

    const item = items.find(it => it.item_id === i.titles);

    opener(item.resolved_url);

    yield archiveItem(config, item.item_id);

    const offseted = offset(items, item);
    const itemIndex = offseted.indexOf(item);
    const newItems = offseted.slice(0, itemIndex).concat(offseted.slice(itemIndex + 1));

    show(config, newItems);
  })();
}

co(function* main () {
  let c;

  try {
    c = yield Config.read();
  } catch (e) {
    if (e.code === 'ENOENT') {
      c = yield Config.init();
    }
  }

  if (!c.consumer_key) {
    const response = yield inquirer.prompt([
      { type: 'input', name: 'consumer_key', message: "What's your consumer key?" },
    ]);

    c.consumer_key = response.consumer_key;
    yield Config.write(c);
  }

  if (!c.access_token) {
    const response = yield getAccessToken(c);

    c.access_token = response.access_token;
    yield Config.write(c);
  }

  const items = yield getItems(c, tag);

  show(c, items);
})();
