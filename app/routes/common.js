module.exports = function (app) {
    
    app.get("/", function(req, res, next){
        res.redirect(301, '/public/index.html');
    });
    
};