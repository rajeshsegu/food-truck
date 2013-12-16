




var App = function (gMap) {

    this.info = [];
    this.gMap = gMap;

    this.adjustSize();
    
    this.init();
    
};

App.prototype = {

    init: function () {
        var self = this;
        this.gMap.init(function () {
            self.getFoodTrucks(function(){
                self.showResults();    
            });
        });

    },
    
    showResults: function(){
        var self = this;
        _.each(this.info, function(result){
            self.gMap.addResult(result.latitude, result.longitude);        
        }); 
    },

    getFoodTrucks: function (callback) {
        $.get("/foodtruck", function (response) {
            console.dir(response);
            this.info = response;
            callback && callback();
        }.bind(this));
    },
    
    adjustSize: function(){
        var ht = $(document.body).height(),
            wt = $(document.body).width();
        
        ht = ht - 50;
        wt = wt;
        
        $('#main').height(ht).width(wt);
        
    }

};