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



     request('http://www.elcomparador.com/futbol/', (error, response, html) => {
         if(!error && response.statusCode == 200){
             const $ = cheerio.load(html);
             app.get('/add_events', (req, res) => {
                 let sql = 'INSERT INTO events SET ?';
              $('.flecha_izquierda').each( (i, el) =>{
                     request('http://www.elcomparador.com/'+$(el).attr('href'), (e, r, h) => {
                     if(!e && r.statusCode == 200){
                         const $ = cheerio.load(h);
                         const markets = [];
                         const bookies = [];
                         const selections = [];
                         placeholder.category = 'futbol';
                         placeholder.name = $('.equipo_left').text()+' vs '+$('.equipo_right').text();
                         placeholder.time = $('.hora').text().trim().split(' - ')[0].split('/').reverse().join('-');
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
                                     console.log(markets[i]+' | '+selections[markets[i]][e]);
                                     $(l).find('#celda_cuotas:not(.combi_cesta)').each((a, b)=>{
                                         if(!isNaN($(b).text())){
                                             console.log(bookies[a]+'    '+$(b).text());
                                         }
                                     })
                                     console.log(' ');
                                     console.log(' ');
                                 });
                            });
                         }
                        
                         console.log('#######################################################################################################################################################################################################################################################################################################################################')
              
                   })

                 })
                 let query = db.query(sql, placeholder, (err, result) => {
                     if(err){
                         throw err;
                     }
                     console.log(result)
                     res.send('evento added');
                 })
             })       
         }
     })
   // getDetails('http://www.elcomparador.com/futbol/eibar-sevilla')







