// Connect to database
// Establishing connection to the database
// Instatiate database
var config = require("./config")();
const Database=require('./database');
var util =require('util');
var request = require('request');


getWebPage = async function(url, cb) {
    await request.get(url, async function(error, result, body) {
        if(!error) {
            cb(null, result);
        } else {
            cb(error, null);
        }
    });
};

getWebPage=util.promisify(getWebPage);

global.pool=new Database();

global.debugon=true;
global.version="0.05";

if (process.env.production) {
    console.log('This is a development env...');
}
else {
    console.log('This is a production env...')
}



var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var monetarystatsRouter = require('./routes/monetarystats');
var networkstatsRouter = require('./routes/networkstats');
var networkstatusRouter = require('./routes/networkstatus');
var diffvsvalueRouter = require('./routes/diffvsvalue');
var whatsnew = require('./routes/whatsnew');

var express = require('express');

const app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/monetarystats', monetarystatsRouter);
app.use('/networkstats', networkstatsRouter);
app.use('/networkstatus', networkstatusRouter);
app.use('/diffvsvalue', diffvsvalueRouter);
app.use('/whatsnew', whatsnew);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// install cron
var cron = require('node-cron');

// Function we do every minute
console.log("Starting cron...\n")
cron.schedule('* * * * *', async () => {
    console.log('Minute crontab initiated...\n');
    cron_networkstatus();

    var interval = 60;
    // Get all available currency pairs with additional info.
    const option = {
        api_key: config.stex_api,
        api_secret: config.stex_secret
    };
    const stocks = require('stocks-exchange-client');

    const se = new stocks.client(option, 'https://app.stex.com/api2', 2);

    se.ticker(function (res) {
        var obj = JSON.parse(res);
        var val = "ATH_BTC";
        var index = -1;
        var filteredObj = obj.find(function (item, i) {
            if (item.market_name === val) {
                index = i;
                return i;
            }
        });

        var ath_sats = Math.round(obj[index].last * 1000000000, 1) / 10;
        var ath_vol = obj[index].vol;
        console.log('Sats: ' + ath_sats);
        console.log('Vol: : ' + ath_vol);
        se.orderbook('ATH_BTC', function (res) {
            var obj = JSON.parse(res);
            var ath_quant = 0;
            var ath_book_buy = 0;
            for (i = 0; i < obj.result.buy.length; i++) {
                ath_quant += obj.result.buy[i].Quantity * 1;
                ath_book_buy += obj.result.buy[i].Quantity * obj.result.buy[i].Rate;
            }
            console.log('ATH quant: ' + ath_quant);
            console.log('ATH bookbuy: ' + ath_book_buy);

            var ath_quant = 0;
            var ath_book_sell = 0;
            for (i = 0; i < obj.result.sell.length; i++) {
                ath_quant += obj.result.sell[i].Quantity * 1;
                ath_book_sell += obj.result.sell[i].Quantity * obj.result.sell[i].Rate;
            }
            console.log('ATH quant: ' + ath_quant);
            console.log('ATH booksell: ' + ath_book_sell);
            // Now we have all data and write them to the database
            var vsql = "INSERT INTO stex (ath_book_buy, ath_book_sell, ath_sats, ath_volume, timeinterval, created) VALUES (" + ath_book_buy + ", " + ath_book_sell + ", " + ath_sats + ", " + ath_vol + ", " + interval + ", '" + pool.mysqlNow() + "');";
            console.log(vsql);
            pool.query(vsql, async (error, rows, fields) => {
                if (error) {
                    if (debugon)
                        console.log('>>> Error: ' + error);
                } else {

                }
            });

        });

    });
    // Here we check the Atheios blockchain data
    console.log('Provide Atheios blockchain data')
    var request = require('request-promise');

    var url = 'https://api.atheios.org/api/getHashRate';

    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
    }, (err, res, data) => {
        if (err) {
            console.log('Error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
        } else {
            // data is already parsed as JSON:
            hashrate = data.getHashRate;
            difficulty = data.getDifficulty;
            blocktime = data.getBlockTime;

            var url = 'https://api.atheios.org/api/getGas';

            request.get({
                url: url,
                json: true,
                headers: {'User-Agent': 'request'}
            }, (err, res, data) => {
                var gasUsed = data.gas[0].gasUsed + data.gas[1].gasUsed + data.gas[2].gasUsed + data.gas[3].gasUsed;
                console.log("Data: %", 100 * (gasUsed / (4 * 8000000)));
                var vsql = "INSERT INTO atheios (hashrate, difficulty, blocktime, gas, created) VALUES (" + hashrate + ", " + difficulty + ", " + blocktime + ", " + gasUsed + ", '" + pool.mysqlNow() + "');";
                console.log(vsql);
                pool.query(vsql, async (error, rows, fields) => {
                    if (error) {
                        if (debugon)
                            console.log('>>> Error: ' + error);
                    } else {

                    }

                });

            });


        }
    });

    // Get the transfer load
    console.log('Provide Atheios GAS stats')



});

async function cron_networkstatus() {
    // Here we check the Atheios network status
    console.log('Provide Atheios network status');
    var i;

    var url = ['https://api.atheios.org', 'https://stats.atheios.org', 'https://bloxxchain.atheios.org', 'https://wiki.atheios.org', 'https://www.atheios.org', 'https://explorer.atheios.org'];
    var up=0;
    var cert=0;
    for (i=0;i<url.length;i++) {
        console.log('Count: %d, Url: %s',i, url[i]);
        try {
            var response= await getWebPage(url[i]);

            if (response.statusCode == 200) {
                console.log('Ok');
                up |= 1<<(i + 1);
            }
        } catch (err) {
            if (err.code=='CERT_HAS_EXPIRED') {
                console.log('Cert error');
                cert |= 1<<(i + 1);
            } else {
                console.log(err.code);
            }
        }

    }
    var vsql = "INSERT INTO networkstatus (up, res1, created) VALUES (" + up + ", " + cert + ", '" + pool.mysqlNow() + "');";
    console.log(vsql);
    await pool.query(vsql, async (error, rows, fields) => {
        if (error) {
            if (debugon)
                console.log('>>> Error: ' + error);
        } else {

        }

    });
    console.log("All data in");
}



module.exports = app;

