var express = require('express');
var router = express.Router();

// Add Route
router.get('/', function(req, res){
    var sql;
    switch(req.query.time) {
        case "3H":
            sql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 3 HOUR)";
            break;
        case "1D":
        default:
            sql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 24 HOUR)"
            break;
        case "3D":
            sql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 72 HOUR)"
            break;
        case "1W":
            sql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 1 WEEK)"
            break;
        case "1M":
            sql="SELECT *\n" +
                "  FROM stex t\n" +
                " WHERE t.created < DATE_SUB(NOW(), INTERVAL 0 HOUR)\n" +
                "   AND t.created > DATE_SUB(NOW(), INTERVAL 1 MONTH)"
            break;
    }
    console.log("Request: ",sql);

    pool.query(sql, function (error, rows, fields) {
        if (error) {
            if (debugon)
                console.log(' >>> DEBUG SQL failed', error);
            guess_spam = false;
            throw error;
        }
        var timestr;
        var tstr;

        var content = "<p>"+rows.length+" samples</p>";
        content+='<a class=\"btn btn-primary\" href=\"monetarystats?time=3H\" role=\"button\">3H</a>';
        content+='<a class=\"btn btn-primary\" href=\"monetarystats?time=1D\" role=\"button\">1D</a>';
        content+='<a class=\"btn btn-primary\" href=\"monetarystats?time=3D\" role=\"button\">3D</a>';
        content+='<a class=\"btn btn-primary\" href=\"monetarystats?time=1W\" role=\"button\">1W</a>';
        content+='<a class=\"btn btn-primary\" href=\"monetarystats?time=1M\" role=\"button\">1M</a>';


        // STEX ATH sats
        content += "<h2 id='athsats'>STEX ATH sats</h2><a class=\"anchorjs-link \" href=\"#athsats\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
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
            "           'label': 'ATH sats price',"+
            "           'data': [";

        for (i=0;i< rows.length;i++) {
            content+=rows[i].ath_sats+", ";
        }
        content=content.substring(0, content.length - 2);
        content+=
            "]," +
            "            'fill': false," +
            "            'borderWidth': 1" +
            "        }]" +
            "    }," +
            "    'options': {'scales': {'yAxes': [{'ticks': {'beginAtZero': true}}]}}"+
            "});</script><div>";

        // STEX ATH buybook
        content += "<h2 id='athorderbuybook'>STEX ATH order buy book</h2><a class=\"anchorjs-link \" href=\"#athorderbuybook\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
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
            "           'label': 'Buy orders',"+
            "           'data': [";

        for (i=0;i< rows.length;i++) {
            content+=rows[i].ath_book_buy+", ";
        }
        content=content.substring(0, content.length - 2);
        content+=
            "]," +
            "            'fill': false," +
            "            'borderWidth': 1" +
            "        }]" +
            "    }," +
            "    'options': {'scales': {'yAxes': [{'ticks': {'beginAtZero': false}}]}}"+
            "});</script>`;";


        // STEX ATH sellbook
        content += "<h2 id='athordersellbook'>STEX ATH order sell book</h2><a class=\"anchorjs-link \" href=\"#athordersellbook\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
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
            "           'label': 'Sell orders',"+
            "           'data': [";

        for (i=0;i< rows.length;i++) {
            content+=rows[i].ath_book_sell+", ";
        }
        content=content.substring(0, content.length - 2);
        content+=
            "]," +
            "            'fill': false," +
            "            'borderWidth': 1" +
            "        }]" +
            "    }," +
            "    'options': {'scales': {'yAxes': [{'ticks': {'beginAtZero': false}}]}}"+
            "});</script>`;";



        // STEX ATH volume
        content += "<h2 id='athvolume'>STEX ATH volume</h2><a class=\"anchorjs-link \" href=\"#athvolume\" aria-label=\"Anchor\" data-anchorjs-icon=\"#\" style=\"padding-left: 0.375em;\"></a>";
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
            "           'label': 'Volume',"+
            "           'data': [";

        for (i=0;i< rows.length;i++) {
            content+=rows[i].ath_volume+", ";
        }
        content=content.substring(0, content.length - 2);
        content+=
            "]," +
            "            'fill': false," +
            "            'borderWidth': 1" +
            "        }]" +
            "    }," +
            "    'options': {'scales': {'yAxes': [{'ticks': {'beginAtZero': false}}]}}"+
            "});</script>`;";


        res.render('monetarystats', {
            title: 'Atheios stats | Monetary Stats',
            tag_headline: 'Monetary stats',
            version: version,
            tag_body: content,
       });
    });
});

module.exports = router;
