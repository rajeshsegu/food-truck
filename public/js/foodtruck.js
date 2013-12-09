//Application
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

}



//Google Maps

var GMap = function (id, options) {
    this.id = id;
    this.map = null;
    this.locMarker = null;
    this.options = {
        zoom: 15
    };
    _.extend(this.options, options);

    //Init the Map
    this.init();
    
    

};

GMap.prototype = {

    init: function (callback) {
        
        google.maps.event.addDomListener(window, 'load', function () {
            this.getMap();
            this.geoLocateMap();
            this.regEvents();            
            callback && callback();
        }.bind(this));
        
        
    },
    
    regEvents: function(){
        google.maps.event.addListener(this.map, 'click', function(event) {
            var loc = event.latLng;            
            this.addLocMarker(loc.lat(), loc.lng());
        }.bind(this));
    },

    geoLocateMap: function () {
        //GeoLocate
        this.geoLocate(function (position) {
            this.addLocMarker('37.78482544885859' || position.coords.latitude, '-122.40670680999756' || position.coords.longitude);
        }.bind(this));
    },

    getMap: function () {
        if (!this.map) {
            this.map = new google.maps.Map(document.getElementById(this.id), this.options);
        }
        return this.map;
    },

    center: function (lat, long) {
        this.map.setCenter(new google.maps.LatLng(lat, long));
    },
    
    addLocMarker: function(lat, long){
        if(this.locMarker){
            this.locMarker.setPosition(new google.maps.LatLng(lat, long));
        }else{
            this.locMarker = this.addMarker(lat, long, "My Location");
            google.maps.event.addListener(this.locMarker, 'click', function(event){
                if (this.locMarker.getAnimation() != null) {
                    this.locMarker.setAnimation(null);
                } else {
                    this.locMarker.setAnimation(google.maps.Animation.BOUNCE);
                }
            }.bind(this));
        }
        this.center(lat, long);
    },

    addMarker: function (lat, long, title) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, long),
            title: title,
            animation: google.maps.Animation.DROP
        });
        marker.setMap(this.map);
        return marker;
    },

    addResult: function (lat, long) {
        var circle = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: 1,
            scale: 4.5,
            strokeColor: 'white',
            strokeWeight: 1
        };
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, long),
            icon: circle
        });
        marker.setMap(this.map);
    },

    geoLocate: function (callback) {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(callback);
        }
    }
}