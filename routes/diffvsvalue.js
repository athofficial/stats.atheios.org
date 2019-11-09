var express = require('express');
var router = express.Router();

/**
 * returns an array with moving average of the input array
 * @param array - the input array
 * @param count - the number of elements to include in the moving average calculation
 * @param qualifier - an optional function that will be called on each
 *  value to determine whether it should be used
 */
function movingAvg(array, count, qualifier){

    // calculate average for subarray
    var avg = function(array, qualifier){

        var sum = 0, count = 0, val;
        for (var i in array){
            val = array[i];
            if (!qualifier || qualifier(val)){
                sum += val;
                count++;
            }
        }

        return sum / count;
    };

    var result = [], val;

    // pad beginning of result with null values
    for (var i=0; i < count-1; i++)
        result.push(null);

    // calculate average for each subarray and add to result
    for (var i=0, len=array.length - count; i <= len; i++){

        val = avg(array.slice(i, i + count), qualifier);
        if (isNaN(val))
            result.push(null);
        else
            result.push(val);
    }

    return result;
}

/* GET home page. */
router.get('/', function(req, res, next) {
    var sql;
    switch(req.query.time) {
        case "3H":
            sql="SELECT *\n" +
                "  FROM atheios t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 3 HOUR)";
            break;
        case "1D":
        default:
            sql="SELECT *\n" +
                "  FROM atheios t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 24 HOUR)"
            break;
        case "3D":
            sql="SELECT *\n" +
                "  FROM atheios t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 72 HOUR)"
            break;
        case "1W":
            sql="SELECT *\n" +
                "  FROM atheios t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 1 WEEK)"
            break;
        case "1M":
            sql="SELECT *\n" +
                "  FROM atheios t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 1 MONTH)"
            break;
    }
    var vsql;
    switch(req.query.time) {
        case "3H":
            vsql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 3 HOUR)";
            break;
        case "1D":
        default:
            vsql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 24 HOUR)"
            break;
        case "3D":
            vsql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 72 HOUR)"
            break;
        case "1W":
            vsql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 1 WEEK)"
            break;
        case "1M":
            vsql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 1 MONTH)"
            break;
    }

    pool.query(sql, function (error, rows, fields) {
        if (error) {
            if (debugon)
                console.log(' >>> DEBUG SQL failed', error);
            guess_spam = false;
            throw error;
        }
        pool.query(vsql, function (error, rows1, fields) {
            if (error) {
                if (debugon)
                    console.log(' >>> DEBUG SQL failed', error);
                guess_spam = false;
                throw error;
            }


            var content = "<p>" + rows.length + " samples</p>";
            content += '<a class=\"btn btn-primary\" href=\"diffvsvalue?time=3H\" role=\"button\">3H</a>';
            content += '<a class=\"btn btn-primary\" href=\"diffvsvalue?time=1D\" role=\"button\">1D</a>';
            content += '<a class=\"btn btn-primary\" href=\"diffvsvalue?time=3D\" role=\"button\">3D</a>';
            content += '<a class=\"btn btn-primary\" href=\"diffvsvalue?time=1W\" role=\"button\">1W</a>';
            content += '<a class=\"btn btn-primary\" href=\"diffvsvalue?time=1M\" role=\"button\">1M</a>';


            // Hashrate
            content += "<h2 id='athhashrate'>ATH hashrate</h2><a class=\"anchorjs-link \" href=\"#athhashrate\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
            content += "<canvas id='chartjs-1' class='chartjs' width='200' height='100'></canvas>";
            content += "" +
                "<script>new Chart(document.getElementById('chartjs-1'), {" +
                "    'type': 'bar'," +
                "    'data': {" +
                "        'labels': [";
            for (i = 0; i < rows.length; i++) {
                timestr = rows[i].created + '';
                tstr = timestr.split("GMT");
                content += "'" + tstr[0] + "', ";
            }
            content = content.substring(0, content.length - 2);
            content += "]," +
                "        'datasets': [{ " +
                "           'label': 'Hashrate'," +
                "           'yAxisID': 'A',"+
                "           'data': [";
            var sats = [];
            for (i = 0; i < rows.length; i++) {
                content += rows[i].hashrate + ", ";
                sats.push(rows1[i].ath_sats);
            }

            content = content.substring(0, content.length - 2);
            content +=
                "]," +
                "            'fill': false," +
                "            'borderWidth': 1" +
                "        }" +
                // This is a mixed dataset now comes the average data set
                ", { " +
                "           'label': 'Ath in sats'," +
                "           'yAxisID': 'B',"+
                "           'data': [" + sats + "],";

            content +=
                "        'type': 'line'," +
                "        'backgroundColor': 'rgba(62,255,199,0.4)'" +
                "        }]" +

                "    }," +
                "  options: {\n" +
                "    scales: {\n" +
                "      yAxes: [{\n" +
                "        id: 'A',\n" +
                "        type: 'linear',\n" +
                "        position: 'left',\n" +
                "      }, {\n" +
                "        id: 'B',\n" +
                "        type: 'linear',\n" +
                "        position: 'right',\n" +
                "                ticks: {\n" +
                "                    beginAtZero: 'true'\n" +
                "                }\n" +
               "      }]\n" +
                "    }\n" +
                "  }\n" +
                "});</script><div>";



            // ATH difficulty
            content += "<h2 id='athdiffiiculty'>ATH difficulty</h2><a class=\"anchorjs-link \" href=\"#athdifficulty\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
            content += "<canvas id='chartjs-3' class='chartjs' width='200' height='100'></canvas>";
            content += "" +
                "<script>new Chart(document.getElementById('chartjs-3'), {" +
                "    'type': 'bar'," +
                "    'data': {" +
                "        'labels': [";
            for (i = 0; i < rows.length; i++) {
                timestr = rows[i].created + '';
                tstr = timestr.split("GMT");
                content += "'" + tstr[0] + "', ";
            }
            content = content.substring(0, content.length - 2);
            content += "]," +
                "        'datasets': [{ " +
                "           'label': 'Difficulty'," +
                "           'data': [";

            for (i = 0; i < rows.length; i++) {
                content += rows[i].difficulty + ", ";
            }
            content = content.substring(0, content.length - 2);
            content +=
                "]," +
                "            'fill': false," +
                "            'borderWidth': 1" +
                "        }" +
                // This is a mixed dataset now comes the average data set
                ", { " +
                "           'label': 'Ath in sats'," +
                "           'yAxisID': 'B',"+
                "           'data': [" + sats + "],";

            content +=
                "        'type': 'line'," +
                "        'backgroundColor': 'rgba(62,255,199,0.4)'" +
                "        }]" +

                "    }," +
                "  options: {\n" +
                "    scales: {\n" +
                "      yAxes: [{\n" +
                "        id: 'A',\n" +
                "        type: 'linear',\n" +
                "        position: 'left',\n" +
                "      }, {\n" +
                "        id: 'B',\n" +
                "        type: 'linear',\n" +
                "        position: 'right',\n" +
                "                ticks: {\n" +
                "                    beginAtZero: 'true'\n" +
                "                }\n" +
                "      }]\n" +
                "    }\n" +
                "  }\n" +
                "});</script><div>";



            res.render('diffvsvalue', {
                title: 'Atheios stats | Diff vs value Stats',
                tag_headline: 'Comparitive stats',
                version: version,
                tag_body: content,
            });
        });
    });
});

module.exports = router;
