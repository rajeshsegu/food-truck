//Google Maps
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

        this.infoWindow = new google.maps.InfoWindow();

        google.maps.event.addDomListener(window, 'load', function () {
            this.getMap();
            this.geoLocateMap();
            this.regEvents();
        }.bind(this));


    },

    regEvents: function(){
        google.maps.event.addListener(this.map, 'click', function(event) {
            var loc = event.latLng;
            this.addLocMarker(loc.lat(), loc.lng());
        }.bind(this));

        google.maps.event.addListener(this.map, 'tilesloaded', function(event) {
            this.trigger("tilesloaded", this);
        }.bind(this));

    },

    geoLocateMap: function () {
        //GeoLocate
        this.geoLocate(function (position) {

            this.addLocMarker('37.78482544885859' || position.coords.latitude, '-122.40670680999756' || position.coords.longitude);
            this.center('37.78482544885859' || position.coords.latitude, '-122.40670680999756' || position.coords.longitude);

            this.trigger('geolocate', this, this.locMarker);

        }.bind(this));
    },

    getMap: function () {
        if (!this.map) {
            this.map = new google.maps.Map(document.getElementById(this.id), this.options);
            this.trigger("created", this);
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

        this.trigger("locMarker", this, lat, long);

        return this.locMarker;
    },

    getLocation: function(){
        var position = this.locMarker.getPosition();
        return {
            lat: position.lat(),
            long: position.lng()
        };
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

    addResult: function (props) {

        props || ( props = {} );

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

        google.maps.event.addListener(marker, 'click', function(){
//            this.infoWindow.setContent(props.content);
//            this.infoWindow.open(this.map, marker);
            this.showInfoWindow(marker, props.content);
        }.bind(this));

        this._markersHash[props.id] = marker;

        return marker;
    },

    showInfoWindow: function(marker, content){
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    },

    getMarker: function(id){
        return this._markersHash[id];
    },

    geoLocate: function (callback) {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(callback);
        }
    },

    distance: function(src, dest){

        var meters = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(src.lat, src.long),
            new google.maps.LatLng(dest.lat, dest.long)
        );

        return ( meters / 1609.344 ).toFixed(2);

    }
});