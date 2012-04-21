var util = require('util'),
    twitter = require('twitter');
    http = require('http');


var twit = new twitter({
   consumer_key: 'JI1TmXuo3wQfXse0EdLcEg',
   consumer_secret: 'fYis39HnUW4GNcDlub8PgL4XUnt1Cp4gjKkHMfv3BY',
   access_token_key: '327235858-fck2bWjWiV78a70BhPBfw4FHebNmH7EDd7dvY1d9',
   access_token_secret: 'hehcMQkgnROjj14W3qPnzBtjeXQFsWDT3YJaWJ2TFw'
});

/*
var twit = new twitter({
    consumer_key: 'dSPu1sL7vbFjAFPJJEQ7w',
    consumer_secret: '79igeWGjzDumqky9atQhifxJZbbZBCLVskB2eunRaw',
    access_token_key: '12078642-zCdwJXevpP3LTUilxb3pxVij1u90Ygp0gIl85fdU0',
    access_token_secret: '52j42FNlS66WesTS3t33bVaCaAGz4ur2n36To7sos'
});
*/
var server = http.createServer(function (request, response) {
 if (request.url.match(/^\/(index.html)?$/)) {
        return serve(response, "/index.html");
    }
});


var io = require('socket.io').listen(server);

var getTrend = function(socket) {
     twit.get('/trends/available.json', {include_entities:true}, function(data) {
        if(data === undefined) {getTrend();}
        if(data !== undefined) {
            console.log(data);
             for (var d in data) {
                if(data[d] !== undefined) {
                    var g = function (name, country, woeid) {
                        twit.get('/trends/'+woeid+'.json', {include_entities:true}, function(trend) {
                            if(trend !== undefined) {
                                console.log(trend[0]);
                                //if(trend[0] !== undefined) {
                                    socket.emit('trends', {'trends' : trend[0], 'name' : name, 'country' : country});
                                //}
                            }
                        });
                    };
                    g(data[d].name, data[d].country, data[d].woeid);
                }
             }
        }
    });
}

//setInterval(getTrend, 10000);
//getTrend();


io.sockets.on('connection', function (socket) {
    getTrend(socket);
});





function serve(res, path, mime) {
    fs.readFile(__dirname + path, function(err, data) {
        if (err)
            return error(res, err);

        res.writeHead(200, {"Content-Type": mime || "text/html"});
        res.end(data);
    });    
}
function error(res, err) {
    res.writeHead(500, {"Content-Type": "text/plain"});
    res.end("Internal server error: " + err);
    console.log(err);
}

server.listen(8081, '127.0.0.1');

