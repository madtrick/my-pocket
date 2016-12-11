'use strict';

const Bluebird = require('bluebird');
const fs = require('fs');

const co = Bluebird.coroutine;
const readFile = Bluebird.promisify(fs.readFile);
const writeFile = Bluebird.promisify(fs.writeFile);

function configFilePath () {
  return `${process.cwd()}/.my-pocket`;
}

module.exports = {
  read: co(function* read () {
    const contents = yield readFile(configFilePath());
    const config = JSON.parse(contents);

    return config;
  }),

  init: co(function* init () {
    const config = {};

    yield writeFile(configFilePath(), JSON.stringify(config));

    return config;
  }),

  write: co(function* write (config) {
    yield writeFile(configFilePath(), JSON.stringify(config));

    return config;
  }),
};
