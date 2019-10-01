 const express = require('express');
 const request = require('request');
 const cheerio = require('cheerio');
 const mysql = require('mysql');

 const db = mysql.createConnection({
     host: "localhost",
     user: "mat",
     password: "tam",
     database: 'oddsmatcher'
 });
         const placeholder = {
             category: '',
             name: '',
             time: ''
         }
 db.connect((err)=> {
     if(err){
         throw err;
     }
     console.log('Mysql Connected')
 });

 const app = express();

 app.listen('3000', () => {
     console.log('Server started on port 3000');
 });

 function addDays(date, amount) {
    var tzOff = date.getTimezoneOffset() * 60 * 1000,
        t = date.getTime(),
        d = new Date(),
        tzOff2;
  
    t += (1000 * 60 * 60 * 24) * amount;
    d.setTime(t);
  
    tzOff2 = d.getTimezoneOffset() * 60 * 1000;
    if (tzOff != tzOff2) {
      var diff = tzOff2 - tzOff;
      t += diff;
      d.setTime(t);
    }
  
    return d;
  }
const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

 let sql = 'DELETE FROM `odds` WHERE `time` < ?;';
 let query = db.query(sql, date, (err, result) => {
     if(err){
         throw err;
     }
 console.log(result);
    })