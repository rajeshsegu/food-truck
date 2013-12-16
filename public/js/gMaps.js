//Backbone-ized Google Maps Object

var GMap = function (id, options) {

    this.id = id;
    this.map = null;
    this.locMarker = null;
    this._markersHash = {};
    this.options = {
        zoom: 15
    };
    _.extend(this.options, options);

    //Init the Map
    this.init();

};

_.extend(GMap.prototype, Backbone.Events, {

    init: function () {

        //Create single instance of the Info Window
        this.infoWindow = new google.maps.InfoWindow();

        //On Load, create Map, Geo Locate and register events
        google.maps.event.addDomListener(window, 'load', function () {
            this.getMap();
            this.geoLocateMap();
            this.regEvents();
        }.bind(this));


    },

    //Register necessary events on the Google Map
    regEvents: function(){
        google.maps.event.addListener(this.map, 'click', function(event) {
            var loc = event.latLng;
            this.addLocMarker(loc.lat(), loc.lng());
        }.bind(this));

        google.maps.event.addListener(this.map, 'tilesloaded', function(event) {
            this.trigger("tilesloaded", this);
        }.bind(this));

    },

    //HTML5 geo locate and mark the location
    geoLocateMap: function () {
        //GeoLocate
        this.geoLocate(function (position) {

            //Geo Location over-ridden as the trucks are mostly populated around SF
            this.addLocMarker('37.78482544885859' || position.coords.latitude, '-122.40670680999756' || position.coords.longitude);
            this.center('37.78482544885859' || position.coords.latitude, '-122.40670680999756' || position.coords.longitude);

            //Trigger 'geolocate' event
            this.trigger('geolocate', this, this.locMarker);

        }.bind(this));
    },

    //Cache the Map object
    getMap: function () {
        if (!this.map) {
            this.map = new google.maps.Map(document.getElementById(this.id), this.options);
            this.trigger("created", this);
        }
        return this.map;
    },

    //Center the map
    center: function (lat, long) {
        this.map.setCenter(new google.maps.LatLng(lat, long));
    },

    //Add a location marker, which is our reference to everything.
    addLocMarker: function(lat, long){
        //Create or reposition existing loc marker
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

        //Trigger is there are existing listeners
        this.trigger("locMarker", this, lat, long);

        //Return
        return this.locMarker;
    },

    //Helper method to get the present location Marker.
    getLocation: function(){
        var position = this.locMarker.getPosition();
        return {
            lat: position.lat(),
            long: position.lng()
        };
    },

    //Add a regular marker with an animation effect to it.
    addMarker: function (lat, long, title) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, long),
            title: title,
            animation: google.maps.Animation.DROP
        });
        marker.setMap(this.map);
        return marker;
    },

    //Add circle marker to the Map
    addResult: function (props) {

        props || ( props = {} );

        //Add circle marker to the Map
        var circle = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: 1,
            scale: 4.5,
            strokeColor: 'white',
            strokeWeight: 1
        };
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(props.lat, props.long),
            icon: circle
        });
        marker.setMap(this.map);

        //On click, show info. window
        google.maps.event.addListener(marker, 'click', function(){
            this.showInfoWindow(marker, props.content);
        }.bind(this));

        //Cache it for easy reference
        this._markersHash[props.id] = marker;

        //Return marker
        return marker;
    },

    //Show info window over markers
    showInfoWindow: function(marker, content){
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    },

    getMarker: function(id){
        return this._markersHash[id];
    },

    //HTML5 GEO LOCATION API
    geoLocate: function (callback) {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(callback);
        }
    },

    //Calculate distance between two sets of <lat, long>
    distance: function(src, dest){

        var meters = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(src.lat, src.long),
            new google.maps.LatLng(dest.lat, dest.long)
        );

        //convert meters to miles
        return ( meters / 1609.344 ).toFixed(2);

    }
});