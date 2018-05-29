const express = require('express'),
      path = require('path'),
      exphbs = require('express-handlebars'),
      request = require('request'),
      bodyParser = require('body-parser'),
      // jsonfile = require('jsonfile'),
      fs = require('fs');

const PORT = process.env.PORT || 5000

const apiKey = '2725c47d4c932f05a10bfabb298c70b6'; // apiKey's OpenWeatherMap

express()
  .use(express.static(__dirname + '/public'))
  .use('/public', express.static(__dirname + '/public'))
  .use(bodyParser.urlencoded({ extended: true }))
  .engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs'}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', '.hbs')
  .get('/', (req, res) => res.render('layouts/main'))
  .post('/api', (req, res) => {
    let city = req.body.city;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    request(url, (err, response, body) => {
      if (err) {
        res.render('layouts/main', { weather: null, error: 'Error, please try again' });
      } else {
        let weather = JSON.parse(body);
        if (weather.main == undefined) {
          res.render('layouts/main', { weather: null, error: 'Error, please try again' });
        } else {
          let file = './public/data.json';
          let data = [];
          data.push(JSON.stringify(weather, null, 2));

          if (fs.existsSync('./public/data.json')) {
            fs.readFile('./public/data.json', (err, extData) => {
              if (err) {
                console.error(err);
                return;
              } else {
                let extJSON = [];
                extJSON.push(extData);
                extJSON.push(data);
                fs.writeFileSync('./public/data.json', extJSON);
              }
            });
          } else {
            fs.writeFile('./public/data.json', data, (err) => {
              if (err) {
                console.error(err);
                return;
              } else {
                console.log("success!")
              }
            });
          }
          res.redirect('/');
        }
      }
    });
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
