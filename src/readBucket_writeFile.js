//Script queries influxdb for some values, then overwrites a file with those values.

////TODO
//Is there a cleaner way to write the async promises etc. Maybe write the functions seperately rather than a thousand nested callbacks
//DONE - dont use token like this. Make it an env variable or at least put it in secrets so it isn't commit

import {writeFile} from 'node:fs'
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {InfluxDB_Api_Token} from './secrets.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = join(__dirname, `../CO2Monitor/readings.json`)

//set debug
const debug = false;

//Initialise Client
import {InfluxDB, Point} from '@influxdata/influxdb-client';
const token = InfluxDB_Api_Token;
const url = 'http://192.168.1.210:8086' //influx url
const client = new InfluxDB({url, token})
const org = `anOrganisation`
const bucket = `aBucket`
const minutesInPast = 10;
const queryClient = client.getQueryApi(org)
const fields = [`co2`, `temperature`, `humidity`]
//extraordinarily rough manual calibration for temp sensor. Could do this with something binary on the actual sensor. Don't want to currently.
const temperature_offset = -10.3

let objectToWriteOut = {};

//initialise a promise for each field in field
const promises = fields.map((field) => {
  return new Promise((resolve, reject) => {
    console.log(`getting mean of ${field}`)
    let fluxQuery = `from(bucket: "${bucket}")
    |> range(start: -${minutesInPast}m)
    |> filter(fn: (r) => r._field == "${field}")
    |> mean()`

    queryClient.queryRows(fluxQuery, {
      //async run the query
      next: (row, tableMeta) => {
        const tableObject = tableMeta.toObject(row)
        if (debug){
        console.log(`DEBUG ${tableObject._field}: ${tableObject._value}`)
        console.log(`DEBUG ${JSON.stringify(tableObject._field, null, 4)}`)
        console.log(`DEBUG ${JSON.stringify(tableObject, null, 4)}`)
        }
        //format and delete properties of the returned query object
        for (let key in tableObject){
          let keysToKeep = [`_stop`, `_value`]
          if (keysToKeep.includes(key)){
            switch (key) {
              case `_stop`:
                tableObject[`lastReadingTime`] = tableObject[key];
                delete tableObject[key];
                break;
            }
          }
          else {
            delete tableObject[key];
          } 
        // Add the cleaned query object to the writeout
        objectToWriteOut = Object.assign( objectToWriteOut, {[`${field}`] : {...tableObject} }) 
        //... is spread operator, unpacks properties of tableObject and assigns to the field directly. (otherwise would have a nested tableObject property too)
        if (debug) {console.log(`DEBUG ${JSON.stringify(objectToWriteOut, null, 4)}`)}
        }
      },
      // async error handling 
      error: (error) => {
        console.error('\nError', error)
        reject(error)
      },
      // when next block completes
      complete: () => {
        resolve();
        console.log('\nSuccess');
      },
    })  
  })
});

//when promises all promises are resolved, go to .then() and write to file.
Promise.all(promises)
  .then(() => {
    objectToWriteOut["temperature"]["_value"] += temperature_offset
    const stringToWriteOut = JSON.stringify(objectToWriteOut, null, 4);
    if (debug) {
      console.log(`DEBUG stringToWriteOut ${stringToWriteOut}`)
      console.log(`DEBUG ${__dirname}`)
      console.log(`DEBUG ${outputPath}`)
    }
    writeFile(outputPath, stringToWriteOut, (err) => {
      if (err) throw err;
        console.log('The file has been saved!');
    });
  })
  .catch((error) => {
    console.error('\nError', error)
  })


  
