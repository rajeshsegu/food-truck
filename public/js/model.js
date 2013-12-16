
//MODELS

var FoodTruck = Backbone.Model.extend({
    defaults: {
        distance: undefined
    },

    matchesApplicant: function(text){
        return ( this.get("applicant").toLowerCase().indexOf(text.toLowerCase()) !== -1)
    },

    matchesFoodItems: function(text){
        return ( this.get("fooditems").toLowerCase().indexOf(text.toLowerCase()) !== -1)
    },

    info: function(){
        var json = this.toJSON();

        json.address = json.address || "No Address";

        return json;

    }
});

var FoodTruckList = Backbone.Collection.extend({

    model : FoodTruck,

    url : "/foodtruck",

    comparator: function(a, b){
        return ( a.get('distance') > b.get("distance") ? 1 : -1 );
    },

    //Call update() and then sort()
    update: function(lat, long, distanceFn){
        this.each(function(model){
            model.set("distance", distanceFn({
                lat: model.get('latitude'), long: model.get('longitude')
            }, {lat: lat, long: long}),
            {silent: true});
        });
        this.sort();
        this.trigger("update");
        return this;
    },

    all: function(){
        return this.models;
    },

    search: function (text) {
        if(!text){
            return this.all();
        }
        return this.filter(function(model) {
            return (model.matchesApplicant(text) || model.matchesFoodItems(text));
        });
    },

    filterByDistance: function(distance){
        return this.filter(function(model){
            return (model.get('distance') <= distance);
        });
    },

    filterResults: function(text, distance){
        distance = distance || 3;
        return _.filter(this.search(text), function(model){
            return (model.get('distance') <= distance);
        });
    }



});

//Application

var FoodTruckApplication = function(){

    this.init();

};

_.extend(FoodTruckApplication.prototype, Backbone.Events, {

    init: function(){

        this.foodTruckView = new FoodTruckView({
            collection  : new FoodTruckList(),
            gMap        : new GMap('map-canvas')
        });

        this.adjustSize();
    },

    adjustSize: function(){
        var ht = $(document.body).height(),
            wt = $(document.body).width();

        ht = ht - 70;
        wt = wt - 20;

        $('#main').height(ht).width(wt);

    }

});



