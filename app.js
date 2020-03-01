// Connect to database
// Establishing connection to the database
// Instatiate database
var config = require("./config")();
const Database=require('./database');
var util =require('util');
var request = require('request');
var logger = require("./logger");


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
global.version="0.0.6";

if (config.development) {
    logger.info('This is a development env...');
}
else {
    logger.info('This is a production env...')
}



var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

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

app.use(morgan('dev'));
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
cron.schedule('* * * * *', async () => {
    logger.info('Minute crontab initiated...\n');

    var interval = 60;
    // Get all available currency pairs with additional info.
    var request = require("request-promise")

    var url = "https://api3.stex.com/public/ticker/579";

    request({

        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            logger.info("Body %s", body); // Print the json response

            var ath_sats = Math.round(body.data.last * 1000000000, 1) / 10;
            var ath_vol = body.data.volume;
            logger.info('Sats: ' + ath_sats);
            logger.info('Vol: : ' + ath_vol);

            request.get({
                url: "https://api3.stex.com/public/orderbook/579",
                json: true,
                headers: {'User-Agent': 'request'}
            }, (err, res, body) => {
                if (err) {
                    console.log('Error:', err);
                } else if (res.statusCode !== 200) {
                    console.log('Status:', res.statusCode);
                } else {
                    // data is already parsed as JSON:

                    var ath_book_buy = body.data.ask_total_amount;
                    logger.info('ATH bookbuy: ' + ath_book_buy);
                    var ath_book_sell = body.data.bid_total_amount;
                    logger.info('ATH booksell: ' + ath_book_sell);
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
                }
            });

        } else {
            logger.info(error);
            throw error;
        }

    });


    cron_networkstatus();


    // Here we check the Atheios blockchain data
    logger.info('Provide Atheios blockchain data')
    var request = require('request-promise');

    var url = 'https://api.atheios.org/api/getHashRate';

    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
    }, (err, res, data) => {
        if (err) {
            logger.error('Error: %s', err);
        } else if (res.statusCode !== 200) {
            logger.info('Status:', res.statusCode);
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
                logger.info("Data: %", 100 * (gasUsed / (4 * 8000000)));
                var vsql = "INSERT INTO atheios (hashrate, difficulty, blocktime, gas, created) VALUES (" + hashrate + ", " + difficulty + ", " + blocktime + ", " + gasUsed + ", '" + pool.mysqlNow() + "');";
                logger.info(vsql);
                pool.query(vsql, async (error, rows, fields) => {
                    if (error) {
                        if (debugon)
                            logger.error('>>> Error: %s',error);
                    } else {

                    }

                });

            });


        }
    });

    // Get the transfer load
    logger.info('Provide Atheios GAS stats');



});

async function cron_networkstatus() {
    // Here we check the Atheios network status
    logger.info('Provide Atheios network status');
    var i;

    var url = ['https://api.atheios.org', 'https://stats.atheios.org', 'https://bloxxchain.atheios.org', 'https://wiki.atheios.org', 'https://www.atheios.org', 'https://explorer.atheios.org'];
    var up=0;
    var cert=0;
    for (i=0;i<url.length;i++) {
        logger.info('Count: %d, Url: %s',i, url[i]);
        try {
            var response= await getWebPage(url[i]);

            if (response.statusCode == 200) {
                logger.info('Ok');
                up |= 1<<(i + 1);
            }
        } catch (err) {
            if (err.code=='CERT_HAS_EXPIRED') {
                logger.info('Cert error');
                cert |= 1<<(i + 1);
            } else {
                logger.error(err.code);
            }
        }

    }
    var vsql = "INSERT INTO networkstatus (up, res1, created) VALUES (" + up + ", " + cert + ", '" + pool.mysqlNow() + "');";
    logger.info("SQL: ",vsql);
    await pool.query(vsql, async (error, rows, fields) => {
        if (error) {
            if (debugon)
                logger.error('>>> Error: ' + error);
        } else {

        }

    });
    logger.info("All data in");
}



module.exports = app;

