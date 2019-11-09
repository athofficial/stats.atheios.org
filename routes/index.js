var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  var request = require('request');

  var url = 'https://api.atheios.org/api/getHashRate';

  request.get({
    url: url,
    json: true,
    headers: {'User-Agent': 'request'}
  }, (err, result, data) => {
    if (err) {
      console.log('Error:', err);
    } else if (result.statusCode !== 200) {
      console.log('Status:', ressult.statusCode);
    } else {
      // data is already parsed as JSON:
      hashrate = data.getHashRate/1000 + " GH/s";
      difficulty = Math.round(data.getDifficulty / 1E7) / 10 + " G";
      blocktime = data.getBlockTime + " sec";

        var url = 'https://api.atheios.org/api/getGas';

        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request'}
        }, (err, result, data) => {
            if (err) {
                console.log('Error:', err);
            } else if (result.statusCode !== 200) {
                console.log('Status:', ressult.statusCode);
            } else {
                console.log(data);
                gaspercentage = 100 * (data.gas[0].gasUsed + data.gas[1].gasUsed + data.gas[2].gasUsed + data.gas[3].gasUsed) / (4 * 8000000);

                var url = 'https://api.coindesk.com/v1/bpi/currentprice.json';

                request.get({
                    url: url,
                    json: true,
                    headers: {'User-Agent': 'request'}
                }, (err, result, data) => {
                    if (err) {
                        console.log('Error:', err);
                    } else if (result.statusCode !== 200) {
                        console.log('Status:', ressult.statusCode);
                    } else {
                        var btcprice = data.bpi.USD.rate_float;

                        var sql = "SELECT * FROM stex ORDER BY id DESC LIMIT 1;";
                        pool.query(sql, function (error, rows, fields) {
                            if (error) {
                                if (debugon)
                                    console.log(' >>> DEBUG SQL failed', error);
                                guess_spam = false;
                                throw error;
                            }
                            var volume = Math.round((rows[0].ath_sats * rows[0].ath_volume / 1E7) * btcprice)/100;
                            var sql = "SELECT * FROM networkstatus ORDER BY id DESC LIMIT 1;";
                            pool.query(sql, function (error, rows, fields) {
                                if (error) {
                                    if (debugon)
                                        console.log(' >>> DEBUG SQL failed', error);
                                    guess_spam = false;
                                    throw error;
                                }

                                var contService = "";
                                if (rows.length == 1) {
                                    if ((rows[0].up & 1) == 1) {
                                        contService += "<a href='https://api.atheios.org' class='btn btn-success'>api.atheios.org</a><br>";
                                    } else {
                                        contService += "<a href='https://api.atheios.org' class='btn btn-danger'>api.atheios.org</a><br>";
                                    }
                                    if ((rows[0].up & 2) == 2) {
                                        contService += "<a href='https://stats.atheios.org' class='btn btn-success'>stats.atheios.org</a><br>";
                                    } else {
                                        contService += "<a href='https://stats.atheios.org' class='btn btn-danger'>stats.atheios.org</a><br>";
                                    }
                                    if ((rows[0].up & 4) == 4) {
                                        contService += "<a href='https://bloxxchain.atheios.org' class='btn btn-success'>bloxxchain.atheios.org</a><br>";
                                    } else {
                                        contService += "<a href='https://bloxxchain.atheios.org' class='btn btn-danger'>bloxxchain.atheios.org</a><br>";
                                    }
                                    if ((rows[0].up & 8) == 8) {
                                        contService += "<a href='https://www.atheios.org' class='btn btn-success'>www.atheios.org</a><br>";
                                    } else {
                                        contService += "<a href='https://www.atheios.org' class='btn btn-danger'>www.atheios.org</a><br>";
                                    }
                                    if ((rows[0].up & 16) == 16) {
                                        contService += "<a href='https://explorer.atheios.org' class='btn btn-success'>explorer.atheios.org</a><br>";
                                    } else {
                                        contService += "<a href='https://explorer.atheios.org' class='btn btn-danger'>explorer.atheios.org</a><br>";
                                    }
                                    if ((rows[0].up & 32) == 32) {
                                        contService += "<a href='https://wiki.atheios.org' class='btn btn-success'>wiki.atheios.org</a><br>";
                                    } else {
                                        contService += "<a href='https://wiki.atheios.org' class='btn btn-danger'>wiki.atheios.org</a><br>";
                                    }
                                }

                                res.render('index', {
                                    title: 'Atheios stats - General stats',
                                    tag_headline: 'General stats',
                                    version: version,
                                    hashrate: hashrate,
                                    difficulty: difficulty,
                                    blocktime: blocktime,
                                    service: contService,
                                    gas: gaspercentage,
                                    volume: volume
                                });
                            });
                        });
                    }
                });



            }
        });
    }
  });
});

module.exports = router;
