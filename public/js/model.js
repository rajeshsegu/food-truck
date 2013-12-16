
//MODELS

//MODEL: FOOD TRUCK
var FoodTruck = Backbone.Model.extend({

    defaults: {
        //Define distance to the existing FoodTruck JSON
        distance: undefined
    },

    //Check if the model matches the text.
    matchesApplicant: function(text){
        return ( this.get("applicant").toLowerCase().indexOf(text.toLowerCase()) !== -1)
    },

    //Check if the model matches the given food items.
    matchesFoodItems: function(text){
        return ( this.get("fooditems").toLowerCase().indexOf(text.toLowerCase()) !== -1)
    },

    //info, post process JSON to fill in missing data.
    info: function(){
        var json = this.toJSON();

        json.address = json.address || "No Address";

        return json;

    }
});

//MODEL: FOOD TRUCK COLLECTION
var FoodTruckList = Backbone.Collection.extend({

    //Collection of type FoodTruck
    model : FoodTruck,

    //REST API to populate the collection
    url : "/foodtruck",

    //SORT comparator method, distance is our primary sort
    comparator: function(a, b){
        return ( a.get('distance') > b.get("distance") ? 1 : -1 );
    },

    //Update's the distance attribute accross the collection models and sort's it again
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

    //All the models in the collection
    all: function(){
        return this.models;
    },

    //Return models that matches the given text.
    search: function (text) {
        if(!text){
            return this.all();
        }
        return this.filter(function(model) {
            return (model.matchesApplicant(text) || model.matchesFoodItems(text));
        });
    },

    //Return models, that are less than the given distance
    filterByDistance: function(distance){
        return this.filter(function(model){
            return (model.get('distance') <= distance);
        });
    },

    //Filter results by both search text and distance.
    filterResults: function(text, distance){
        distance = distance || 3;
        return _.filter(this.search(text), function(model){
            return (model.get('distance') <= distance);
        });
    }

});

//Application Model

var FoodTruckApplication = function(){
    //Start Initializing
    this.init();
};

//Mixin Events to allow trigger/on methods
_.extend(FoodTruckApplication.prototype, Backbone.Events, {

    //Create Application View & adjust size
    init: function(){

        this.foodTruckView = new FoodTruckView({
            collection  : new FoodTruckList(),
            gMap        : new GMap('map-canvas')
        });

        this.adjustSize();
    },

    //Adjust Size as per the screen size.
    adjustSize: function(){
        var ht = $(document.body).height(),
            wt = $(document.body).width();

        ht = ht - 70;
        wt = wt - 20;

        $('#main').height(ht).width(wt);

    }

});



