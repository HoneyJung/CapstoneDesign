var express = require('express')
var app = express()
var moment = require('moment')
var now = moment();

fs = require('fs');
mysql = require('mysql');

var accountInfo = fs.readFileSync('accountInfo.txt').toString().split("\n");
var connection = mysql.createConnection({
    host: accountInfo[0],
    user: accountInfo[1],
    password: accountInfo[2],
    database: accountInfo[3]
})
connection.connect();


app.get('/graph', function (req, res) {
    console.log('got app.get(graph)');
    var html = fs.readFile('./graph.html', function (err, html) {
    html = " "+ html
    console.log('read file');

    var qstr = 'select * from temp_sensors ';
    connection.query(qstr, function(err, rows, cols) {
      if (err) throw err;

      var data = "";
      var comma = ""
      for (var i=0; i< rows.length; i++) {
         r = rows[i];
         console.log(r);
	 var now = moment(rows[i].time).add(-1, 'month');
         data += comma + "[new Date(" + now.format('YYYY,MM,DD,HH,mm') + ",)," + r.value + "]";
         comma = ",";
      }
      var header = "data.addColumn('date', 'Date/Time');"
      header += "data.addColumn('number', 'Temperature');"
      html = html.replace("<%HEADER%>", header);
      html = html.replace("<%DATA%>", data);

      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(html);
      now = moment(rows[0].time).add(-1, 'month');
      res.write('Estimate from ' + now.format('YYYY,MM,DD, HH:mm'));
      now = moment(rows[rows.length - 1].time).add(-1, 'month');
      res.write(' to ' + now.format('YYYY,MM,DD, HH:mm'));
      res.end();
    });
  });
})

var server = app.listen(8083, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('listening at http://%s:%s', host, port)
});
