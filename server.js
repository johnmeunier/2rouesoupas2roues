var spdy = require('spdy'),
    fs = require('fs'),
    request = require('request'),
    moment = require('moment'),
    pug = require('pug');

var options = {
    // key: fs.readFileSync(__dirname + '/keys/key.pem'),
    // cert: fs.readFileSync(__dirname + '/keys/cert.pem'),    
    key: fs.readFileSync(__dirname + '/keys/selfSignCertificate.key'),
    cert: fs.readFileSync(__dirname + '/keys/selfSignCertificate.crt'),
    passphrase: 'XXXX',
    spdy: {
        protocols: ['h2', 'spdy/3.1', 'http/1.1'],
    }
};

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var server = spdy.createServer(options, function (req, res) {
    if(req.url == '/' || req.url == '/about'){ // Deserve index
        var pageName = 'main';
        if(req.url == '/about'){
            pageName = 'about';
        }
        console.log('### Connection ###');
        request('https://api.apixu.com/v1/forecast.json?key=ab1eee1449a4406786181648172203&q=Roubaix', function(error, response, body){
            res.writeHead(200);
            var data = JSON.parse(body);
            var location = data.location;
            var todayAvg = data.forecast.forecastday[0].day;
            var todayByHour = data.forecast.forecastday[0].hour;
            var current = data.current;
            var currentHour = moment(current.last_updated_epoch*1000).format('HH');
            todayByHour = todayByHour.slice(currentHour, todayByHour.length);
            res.end(pug.renderFile(`./${pageName}.pug`, 
                {
                    todayAvg : todayAvg, 
                    todayByHour : todayByHour,
                    location : location, 
                    Moment : moment, 
                    date : {
                        lastUpdate : moment(current.last_updated_epoch*1000).format('DD/MM/YYYY HH:mm')
                    }
                }
            ));
        });
    } else { // Deserve static file, relative to their pathr
        console.log(req.url);
        if(req.url.substring(req.url.indexOf('.')+1, req.url.length) == 'js'){
            res.setHeader('content-type', 'application/javascript');
        }
        res.writeHead(200);
        fs.readFile('.'+req.url, function read(err, data) {
            if (err) {
                res.end();
            }
            res.end(data);
        });
    }

});

server.listen(3000);

