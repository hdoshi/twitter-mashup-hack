var util = require('util'),
    twitter = require('twitter');
    http = require('http');

var twit = new twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
});


var server = http.createServer(function (request, response) {
    if (request.url.match(/^\/(index.html)?$/)) {
        return serve(response, "/index.html");
    }
});


var io = require('socket.io').listen(server);

var getTrend = function(socket) {
     twit.get('/trends/available.json', {include_entities:true}, function(data) {
        if(data === undefined) {
            getTrend();
        }
        else {
            for (var d in data) {
                if(data[d] !== undefined) {
                    var getTopic = function (name, country, woeid) {
                        twit.get('/trends/'+woeid+'.json', {include_entities:true}, function(trend) {
                            if(trend !== undefined) {
                                if(trend[0] !== undefined) {
                                    socket.emit('trends', {'trends' : trend[0], 'name' : name, 'country' : country});
                                }
                            }
                        });
                    };
                    getTopic(data[d].name, data[d].country, data[d].woeid);
                }
            }
        }
    });
}

io.sockets.on('connection', function (socket) {
    socket.on('getData', function(data) {
        getTrend(this);
    });
});

function serve(res, path, mime) {
    fs.readFile(__dirname + path, function(err, data) {
        if (err) {
            return error(res, err);
        }
        res.writeHead(200, {"Content-Type": mime || "text/html"});
        res.end(data);
    });    
}

function error(res, err) {
    res.writeHead(500, {"Content-Type": "text/plain"});
    res.end("Internal server error: " + err);
    console.log(err);
}

server.listen(process.env.PORT || 3000);
