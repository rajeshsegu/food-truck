var http = require('http');


//Helper Method, fetch() from a third party url.
function fetch(url, fn) {

    http.get(url, function (response) {
        var body = '';

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            fn(body);
        });
    }).on('error', function (e) {
            console.log("Got error: ", e);
        });
}

//Get Food Truck JSON
function getFoodTruck(req, res, next){

    var url = "http://data.sfgov.org/resource/rqzj-sfat.json";

    fetch(url, function(data){
        res.setHeader("Content-Type", "application/json");
        res.end(data);
    });

}

module.exports = function (app) {

    //GET REST end-point
    app.get("/foodtruck", getFoodTruck);

};