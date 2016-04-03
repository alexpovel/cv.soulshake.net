

var blessed = require('blessed')

patchBlessed()

var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , present = require('./presenter')
  , contrib = require('blessed-contrib')

var port = process.env.PORT || 1337

http.createServer(function (req, res) {

  if (req.method == 'POST') {
      var body = '';
      req.on('data', function (data) {
          body += data;

          // Too much POST data, kill the connection!
          if (body.length > 1e6)
              req.connection.destroy();
      });
      req.on('end', function () {
          present(req, res, body, function(err) {
            if (err) console.log(new Error().stack)
            if (err) return contrib.serverError(req, res, err)
          })
      });
  }
  else {
      if (req.headers["user-agent"] && req.headers["user-agent"].indexOf('curl')!=-1) {
        
        var content = fs.readFileSync(__dirname+'/resume.xml')
        //var content = fs.readFileSync(__dirname+'/'+process.argv[2])
        present(req, res, content, function(err) {
            if (err) console.log(new Error().stack)
            if (err) return contrib.serverError(req, res, err)
        })
        return
      }
      else {
        res.writeHead(301, {'Location': 'https://github.com/soulshake/cv.soulshake.net'});
        res.end()
        return
      }
  }
    
    
}).listen(port, '0.0.0.0');

/*in the context of web server the following code will leak:

http.createServer(function (req, res) {
        var s = contrib.createScreen(req, res)
        //alternatively:
        //var program = new blessed.Program()
        
        setTimeout(function() {res.end(Date.now() + "")}, 0)
    
}).listen(8080);

this comes down to event registrations on program (the latest commit here points them https://github.com/yaronn/blessed-patch-temp)
*/
function patchBlessed() {
  blessed.Program.prototype.listem = function() {}
  process.on = function() {}
}

console.log('Server running at http://127.0.0.1:'+port+'/');
