/*!
 * Web Server
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var express = require('express'),    
    utils   = require('./app/utils/utils'),    
    config  = require("./config/config.json"),
    info    = require("./package.json");

//Setup Express
var app = express();

console.log('Node Server Started!');
console.log('Running Version ' + info.version);

app.configure(function(){
    
    //Handlebar templates
    //More @ https://github.com/donpark/hbs
    app.set('views', __dirname + '/app/views');        
    app.set('view engine', 'hbs');
    
    //The order of which middleware are "defined" using app.use() is very important, 
    // they are invoked sequentially, thus this defines middleware precedence.        
    
    app.use(express.logger({ format: 'dev' }));
        
    app.use(express.cookieParser());
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: './data/files' }));
    app.use(express.methodOverride());    
    app.use(express.compress());
    app.use(express.responseTime());
    
    //Handle favicon
    app.use(express.favicon());
    
    //Log Errors
    app.use(function (err, req, res, next) {        
        console.error(err.stack);
        next(err);
    });
    
});



//REGISTER ROUTERS

// "app.router" positions our routes 
// above the middleware defined below,
// this means that Express will attempt
// to match & call routes _before_ continuing
// on, at which point we assume it's a 404 because
// no route has handled the request.

app.use(app.router);

//Static files can be served with express' static middleware. 
//I usually make a directory for all static files to be served from the "public" folder.
app.use('/public', express.static(__dirname + '/public', { maxAge: 86400000 /*one-day*/ }));

//REST / URL ROUTES
require("./app/routes/common")(app);
require("./app/routes/foodtruck")(app);

//PROCESS
process.on('uncaughtException', function (err) {
  console.log('PROCESS: Caught exception: ' + err);
});

process.on('exit', function() {  
  console.log('PROCESS: !!!!!EXITED!!!!');
});


//Kick-Start the server

app.listen( config.getValue("server.port"),  //PORT
            config.getValue("server.host"));  //HOSTNAME

console.log(['Server running at http://', config.getValue("server.host"), ':', config.getValue("server.port"), '/'].join(""));