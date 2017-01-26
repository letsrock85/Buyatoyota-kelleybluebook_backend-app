import request from 'request';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import CSV from 'csv';
import Client from 'ftp';
import logger from './libs/logger';

// todo move to configs
const host = 'http://services.serving-sys.com';
const sitePath = '/custprojassets/prd/features/static/0368b9e.netsolvps.com/';
const tempFolder = path.join(__dirname, '/tmp/input/');
const xlsxTempFileName = 'New-Car-Year-Make-Model-VehicleId.xlsx';
const csvTempFileName = 'conquestTargetAudience.csv';
const xlsxTempFile = tempFolder + xlsxTempFileName;
const csvTempFile = tempFolder + csvTempFileName;
// todo move to configs
const connectionProperties = {
  host: "0368b9e.netsolvps.com",//"50.87.248.100",
  user: "wdtcaaftp",//"jason@wolaverdesigns.com",
  password: "Wd@2016",//"Enter123!",
  port: 21,
  connTimeout: 60000,
  pasvTimeout: 60000,
  keepalive: 3000
};
const desireKeys = ['vehicleid', 'primarybodystyle', 'year', 'manufacturer', 'model', 'style'];

function formatObjKeysToLowerCaseWithSpecKeys(obj, specKeys) {
  // all keys to lower case
  const keys = Object.keys(obj);
  let n = keys.length;
  const newObj = {};
  while(n--) {
    const key = keys[n];
    const keyLower = key.toLowerCase();
    if (Array.isArray(specKeys) && specKeys.indexOf(keyLower) === -1) {
      continue;
    }
    newObj[keyLower] = obj[key];
  }
  return newObj;
}


export default class App {
  constructor(params) {
    this.resultCollector = {
      reqCounter: 0,
      keyCounter: 0,
      loseCounter: 0,
      winCounter: 0,
      markedRows: 0,
      fails: 0,
      matchCounter: 0,
      notMatchCounter: 0,
      matchProcessedRowsCounter: 0,
      determineWinnerCounterExpert: 0,
      determineWinnerCounterConsumer: 0
    };
    this.regions = params.regions;
    this.order = params.regionOrders || 0;
    this.lookUpTableJson = null;
    this.conquestFileJson = null;

  }

  async start() {
    const times = this.regions.length || 0;
    while(this.order < times) {
      await this.run().catch(logger.log);
      this.order++;
    }

    logger.log('info', 'Finished');
  }

  async run() {
    const xlsxLookUpTable = `${host}${sitePath}${this.regions[this.order]}/html5/${xlsxTempFileName}`;
    const csvTargetAudienceFile = `${host}${sitePath}${this.regions[this.order]}/html5/${csvTempFileName}`;
    // download xlsxLookUpTable
    await this.downloadTables(xlsxLookUpTable, xlsxTempFile);
    // download csvTargetAudienceFile
    await this.downloadTables(csvTargetAudienceFile, csvTempFile);
    // todo move to method
    // parse
    const conquestFile = await new Promise((resolve, reject) => {
      fs.readFile(csvTempFile, 'utf8', function (err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      })
    });
    this.conquestFileJson = await new Promise((resolve, reject) => {
      CSV.parse(conquestFile, {
        delimiter: ';', columns: true, skip_empty_lines: true
      }, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
    this.conquestFileJson.forEach((obj) => obj.variationTargetAudience = 'compare=nullified');
    // todo move to method
    this.lookUpTableJson = XLSX.readFile(xlsxTempFile);
    this.lookUpTableJson = XLSX.utils.sheet_to_json(this.lookUpTableJson.Sheets[this.lookUpTableJson.SheetNames[0]]);
    this.lookUpTableJson = this.lookUpTableJson.map((obj) => formatObjKeysToLowerCaseWithSpecKeys(obj, desireKeys));


    await this.uploadOnFtp(csvTempFile, `${this.regions[this.order]}/html5/_bak_${csvTempFileName}`);

  }

  async downloadTables(url, dest) {
    return new Promise((resolve, reject) => {
      const stream = request
        .get(url)
        .on('error', reject)
        .pipe(fs.createWriteStream(dest));
      stream.on('error', reject);
      stream.on('finish', resolve);
    });
  }

  async uploadOnFtp(path, dest) {
    return new Promise((resolve, reject) => {
      // Write to TCAA ftp
      const c = new Client();
      c.connect(connectionProperties);
      c.on('ready', function() {
        c.put(path, dest, function(err) {
          if(err) return reject(err);
          c.end();
        });
      });

      c.on('end', resolve);
    });
  }

}
