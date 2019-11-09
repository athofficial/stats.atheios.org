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

    pool.query(sql, function (error, rows, fields) {
        if (error) {
            if (debugon)
                console.log(' >>> DEBUG SQL failed', error);
            guess_spam = false;
            throw error;
        }

        var content = "<p>"+rows.length+" samples</p>";
        content+='<a class=\"btn btn-primary\" href=\"networkstats?time=3H\" role=\"button\">3H</a>';
        content+='<a class=\"btn btn-primary\" href=\"networkstats?time=1D\" role=\"button\">1D</a>';
        content+='<a class=\"btn btn-primary\" href=\"networkstats?time=3D\" role=\"button\">3D</a>';
        content+='<a class=\"btn btn-primary\" href=\"networkstats?time=1W\" role=\"button\">1W</a>';
        content+='<a class=\"btn btn-primary\" href=\"networkstats?time=1M\" role=\"button\">1M</a>';


        // Hashrate
        content += "<h2 id='athhashrate'>ATH hashrate</h2><a class=\"anchorjs-link \" href=\"#athhashrate\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
        content += "<canvas id='chartjs-1' class='chartjs' width='200' height='100'></canvas>";
        content += "" +
            "<script>new Chart(document.getElementById('chartjs-1'), {" +
            "    'type': 'bar'," +
            "    'data': {"+
            "        'labels': [";
        for (i=0;i< rows.length;i++) {
            timestr=rows[i].created+'';
            tstr=timestr.split("GMT");
            content+="'"+tstr[0]+"', ";
        }
        content=content.substring(0, content.length - 2);
        content+= "]," +
            "        'datasets': [{ " +
            "           'label': 'Hashrate',"+
            "           'data': [";
        var avhash=[];
        for (i=0;i< rows.length;i++) {
            content+=rows[i].hashrate+", ";
            avhash.push(rows[i].hashrate);
        }

        content=content.substring(0, content.length - 2);
        content+=
            "]," +
            "            'fill': false," +
            "            'borderWidth': 1" +
            "        }" +
        // This is a mixed dataset now comes the average data set
            ", { " +
            "           'label': 'Hashrate moving average 5',"+
            "           'data': ["+ movingAvg(avhash, 5, function(val){ return val != 0; }) + "],";

        content+=
            "        'type': 'line'," +
            "        'backgroundColor': 'rgba(62,255,199,0.4)'" +
            "        }]" +

            "    }," +
            "    'options': {'scales': {'yAxes': [{'ticks': {'beginAtZero': true}}]}}"+
            "});</script><div>";




        // ATH blocktime
        content += "<h2 id='athblocktime'>ATH blocktime</h2><a class=\"anchorjs-link \" href=\"#athblocktime\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
        content += "<canvas id='chartjs-2' class='chartjs' width='200' height='100'></canvas>";
        content += "" +
            "<script>new Chart(document.getElementById('chartjs-2'), {" +
            "    'type': 'bar'," +
            "    'data': {"+
            "        'labels': [";
        for (i=0;i< rows.length;i++) {
            timestr=rows[i].created+'';
            tstr=timestr.split("GMT");
            content+="'"+tstr[0]+"', ";
        }
        content=content.substring(0, content.length - 2);
        content+= "]," +
            "        'datasets': [{ " +
            "           'label': 'Blocktime',"+
            "           'data': [";

        var avblock=[];
        for (i=0;i< rows.length;i++) {
            content+=rows[i].blocktime+", ";
            avblock.push(rows[i].blocktime);

        }
        content=content.substring(0, content.length - 2);
        content+=
            "]," +
            "            'fill': false," +
            "            'borderWidth': 1" +
            "        }" +
            // This is a mixed dataset now comes the average data set
            ", { " +
            "           'label': 'Blocktime moving average 5',"+
            "           'data': ["+ movingAvg(avblock, 5, function(val){ return val != 0; }) + "],";

        content+=
            "        'type': 'line'," +
            "        'backgroundColor': 'rgba(62,62,199,0.2)'" +
            "        }]" +
            "    }," +
            "    'options': {'scales': {'yAxes': [{'ticks': {'beginAtZero': false}}]}}"+
            "});</script>`;";


        // ATH difficulty
        content += "<h2 id='athdiffiiculty'>ATH difficulty</h2><a class=\"anchorjs-link \" href=\"#athdifficulty\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
        content += "<canvas id='chartjs-3' class='chartjs' width='200' height='100'></canvas>";
        content += "" +
            "<script>new Chart(document.getElementById('chartjs-3'), {" +
            "    'type': 'bar'," +
            "    'data': {"+
            "        'labels': [";
        for (i=0;i< rows.length;i++) {
            timestr=rows[i].created+'';
            tstr=timestr.split("GMT");
            content+="'"+tstr[0]+"', ";
        }
        content=content.substring(0, content.length - 2);
        content+= "]," +
            "        'datasets': [{ " +
            "           'label': 'Difficulty',"+
            "           'data': [";

        for (i=0;i< rows.length;i++) {
            content+=rows[i].difficulty+", ";
        }
        content=content.substring(0, content.length - 2);
        content+=
            "]," +
            "            'fill': false," +
            "            'borderWidth': 1" +
            "        }]" +
            "    }," +
            "    'options': {'scales': {'yAxes': [{'ticks': {'beginAtZero': true}}]}}"+
            "});</script>`;";

        // STEX ATH gas load
        content += "<h2 id='athgas'>ATH Gas consumption</h2><a class=\"anchorjs-link \" href=\"#athgas\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
        content += "Gas cost is 21000 wei and the max gas per block is 8 Million wei. The gas consumption shown here is averages over 4 blocks.<br>"
        content += "<canvas id='chartjs-4' class='chartjs' width='200' height='100'></canvas>";
        content += "" +
            "<script>new Chart(document.getElementById('chartjs-4'), {" +
            "    'type': 'bar'," +
            "    'data': {"+
            "        'labels': [";
        for (i=0;i< rows.length;i++) {
            timestr=rows[i].created+'';
            tstr=timestr.split("GMT");
            content+="'"+tstr[0]+"', ";
        }
        content=content.substring(0, content.length - 2);
        content+= "]," +
            "        'datasets': [{ " +
            "           'label': 'Gas consumption',"+
            "           'data': [";
        var avgas=[];
        for (i=0;i< rows.length;i++) {
            content+=(rows[i].gas/4)+", ";
            avgas.push(rows[i].gas/4);
        }
        content=content.substring(0, content.length - 2);
        content+=
            "]," +
            "            'fill': false," +
            "            'borderWidth': 1" +
            "        }" +
            // This is a mixed dataset now comes the average data set
            ", { " +
            "           'label': 'Gas moving average 5',"+
            "           'data': ["+ movingAvg(avgas, 10, function(val){ return (val)}) + "],";

        content+=
            "        'type': 'line'," +
            "        'backgroundColor': 'rgba(62,62,0,0.3)'" +
            "        }]" +

            "    }," +
            "    'options': {'scales': {'yAxes': [{'ticks': {'beginAtZero': true}}]}}"+
            "});</script>`;";





        res.render('networkstats', {
            title: 'Atheios stats | Network Stats',
            tag_headline: 'Network stats',
            version: version,
            tag_body: content,
        });
    });
});

module.exports = router;
