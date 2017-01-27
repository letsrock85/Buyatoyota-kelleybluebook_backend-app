import express from 'express';
import nconf from 'nconf';
import path from 'path';


import App from './app';
import Cron from './cron';
import logger from './libs/logger';
import { BaseError, NotFoundError, ApiError, ParseError } from './libs/errors';
//settings
nconf.file(path.resolve(__dirname, 'configs/settings.json'));


const server = express();
const cronApp = new Cron();
let runned = false;

// todo refactor set port
server.set('port', (process.env.PORT || nconf.get('port')));

server.get('/run', (req, res) => {
  const startedDate = new Date();
  let regions;
  let regionOrders;

  if (runned) {
    const err = new BaseError({status: 403, message: 'Task already runned'});
    return res.status(err.status).json({ error: err.message });
  }
  if (!req.query || !req.query.regions) {
    const err = new NotFoundError({status: 400, message: 'Bad params'});
    return res.status(err.status).json({ error: err.message });
  }

  runned = true;
  logger.log('info', `Started at: ${startedDate}`);
  // regions parse
  regions = req.query.regions.split(',');
  regionOrders = req.query.order || 0;

  const app = new App({
    regions, regionOrders,
  });

  cronApp.start(() => {
    app.start().then(() => {
      runned = stop;
    }).catch(logger.log);
  });
  return res.status(200).json({ message: 'Successful runned' });
});

server.get('/stop', (req, res) => {
  cronApp.stop();

  return res.status(200).json({ message: 'Successful stopped'});
});

server.listen(server.get('port'), () => {
  console.log(`Node app is running at localhost: ${server.get('port')}`);
});
