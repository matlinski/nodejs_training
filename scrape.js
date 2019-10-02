const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs'); 
const mysql = require('mysql');
let temp;
const sports = [{id: 1, name: 'fútbol'}, {id: 2, name: 'tenis'}, {id: 23, name: 'baloncesto'}]

const db = mysql.createConnection({
    host: "localhost",
    user: "mat",
    password: "tam",
    database: 'oddsmatcher'
});
    let placeholder;
    const odds_list = [];
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
function getPage(url, sport){
    axios.get(url, sport)
    .then((response) => {
        if(response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        $('.flecha_izquierda').each( (i, el) =>{
            axios.get('http://www.elcomparador.com/'+$(el).attr('href'))
            .then((response) => {
                if(response.status === 200) {
                    placeholder = {};
                    const markets = [];
                    const bookies = [];
                    const selections = [];
                    const h = response.data;
                    const $ = cheerio.load(h);
                    placeholder.category = sport; //CATEGORY 1ST
                    placeholder.name = $('.equipo_left').text()+' vs '+$('.equipo_right').text(); //NAME 2ND
                    placeholder.time = $('.hora').text().trim().split(' - ')[0].split('/').reverse().join('-')+' '+$('.hora').text().trim().split(' - ')[1]; //TIME 3RD
                    $('#celda_interna_categoriaapuestas').each((i, el)=>{
                        markets.push($(el).text());
                    });
                    $('#fila_cuotas>#celda_logos>a').each((i, el)=>{
                        bookies.push($(el).attr('title').substring(5));
                    });
                    $('#contenedor_evento_interna').each((i, el)=>{
                        selections[markets[i]] = [];
                            $(el).find('#fila_cuotas>#celda_categoria_interna>span').each((e, l)=>{
                                selections[markets[i]].push( $(l).text());
                            });
                            $(el).find('.ocultar #fila_cuotas').each((e, l)=>{
                                placeholder.market = markets[i]; //MARKET 4TH
                                placeholder.selection = selections[markets[i]][e]; //SELECTION 5TH
                                $(l).find('#celda_cuotas:not(.combi_cesta)').each((a, b)=>{
                                    if(!isNaN($(b).text())){
                                        placeholder.bookies = bookies[a]; //BOOKIES 6TH
                                        placeholder.back_odds = $(b).text(); //BACK_ODDS 7TH
                                        let check = true;
                                        for(let k in placeholder) {
                                            if(typeof k == 'undefined' || k.length === 0 || k === null || !k){
                                                check = false;
                                            }   else    {
                                                if(odds_list.length >= 2500){
                                                    temp = odds_list.shift();
                                                }
                                            }
                                        }
                                        if(check === true && placeholder.length !== 0){
                                            odds_list.push([placeholder.category, placeholder.name, placeholder.time, placeholder.market, placeholder.selection, placeholder.bookies, placeholder.back_odds])
                                        };
                                    }
                                })
                            });
                       });
                    // console.log(placeholder);
                    return odds_list;   
                }
            })
            .then((input)=>{
                if(input.length != 0){
                    let sql = 'INSERT IGNORE INTO `odds` (`category`, `name`, `time`, `market`, `selection`, `bookies`, `back_odds`) VALUES ?';
                    let query = db.query(sql, [input.map(item => [item[0], item[1], item[2], item[3], item[4], item[5], item[6]])], (err, result) => {
                        if(err){
                            throw err;
                        }
                    console.log(result);
                })
            }
                 
            })
            .catch(function(e) {
                console.log(e); // "Uh-oh!"
            });
        })
    }
    })
    .catch(function(e) {
        console.log(e); // "Uh-oh!"
    });
}

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

let day;
sports.forEach((sport)=>{
    day = addDays(new Date(), 0).toISOString().replace(/T/, ' ').replace(/\..+/, '').split(' ')[0];
    getPage('http://www.elcomparador.com/html/contenido/mas_partidos.php?deporte='+sport.id+'&fecha='+day, sport.name);
    for(let inc = 0; inc < 1; inc++){
        day = addDays(new Date(), inc).toISOString().replace(/T/, ' ').replace(/\..+/, '').split(' ')[0];
        for(let offset = 30; offset <= 40; offset += 30){
            getPage('http://www.elcomparador.com/html/contenido/mas_partidos.php?deporte='+sport.id+'&fecha='+day+'&offset='+offset, sport.name);
        }
    }
})