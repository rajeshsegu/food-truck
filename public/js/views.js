// The main view of the application
var FoodTruckView = Backbone.View.extend({

    // Base the view on an existing element
    el: $('#main'),

    gMap: null,

    collection: null,

    initialize: function(options){

        // Cache these selectors
        this.setElement(this.el);

        this.gMap = options.gMap;

        this.handleSearch();

        this.registerListeners();

        this.truckListView = new FoodTruckListView({
            collection: new FoodTruckList(),
            gMap: this.gMap
        });

        this.render();

        this._markerHash = {};

    },

    all: function(){
        return this.collection.all();
    },

    search: function(text){
        return this.collection.search(text);
    },

    filterDistance: function(distance){
        return this.collection.filterByDistance(distance);
    },

    filterResults: function(text, distance){
        return this.collection.filterResults(text, distance);
    },

    updateDistance: function(lat, long){
        this.collection.update(lat, long, this.gMap.distance);
    },

    updateList: function(searchText, distance){

        var list;
        if(!searchText && !distance){
            list = this.all();
        }else{
            list = this.filterResults(searchText, distance);
        }

        return this.truckListView.update(list);
    },

    filterList: function(distance){
        this.truckListView.update(this.filterDistance());
    },

    updateLocation: function(){
        if(this.gMap.locMarker){
            var location = this.gMap.getLocation();
            this.updateDistance(location.lat, location.long);
        }
    },

    searchAction: function(){

        var distanceVal = $('#search-range').val() / 10,
            searchText  = $('#search-textbox').val();

        this.updateList(searchText, distanceVal);
    },

    handleSearch: function(){
        $('#search-textbox').bind('keyup', this.searchAction.bind(this));
        $('#search-textbox-btn').bind('click', this.searchAction.bind(this));
        $('#search-range').bind('input change', function(){
            $('#distance-val').html($('#search-range').val() / 10);
            this.searchAction();
        }.bind(this));
    },

    render: function(){

        //Clear and then render()
        $('#search-results').html('')
            .append(this.truckListView.render().el);

        return this;
    },

    registerListeners: function(){

        this.collection.on('sync', function(collection, resp){

            if(this.gMap.locMarker){
                this.updateLocation();
                this.updateList();
            }

            _.delay(function(){
                this.addAll();
            }.bind(this), 1000);

        }.bind(this));

        this.gMap.on('created', function(){
            this.collection.fetch();
        }.bind(this));

        this.gMap.on('locMarker', function(gMap, lat, long){

            this.updateDistance(lat, long);

            this.updateList();

        }, this);

    },

    addOne: function( foodTruck ) {
        var template = _.template($('#infoTemplate').html());

        var marker = this.gMap.addResult({
            id: foodTruck.get("cnn"),
            lat: foodTruck.get('latitude'),
            long: foodTruck.get('longitude'),
            content: template(foodTruck.info())
        });
    },

    addAll: function() {
        this.collection.each(function(truck){
            this.addOne(truck);
        }.bind(this));
    }

});

var FoodTruckListView = Backbone.View.extend({

    tagName: 'ul',

    className: 'list-unstyled fan oAuto',

    collection: null,

    gMap: null,

    initialize: function(options){
        this.on('update', this.render);
        this.gMap = options.gMap;

    },

    update: function(models){
        this.collection.reset(models);
        this.collection.sort();
        this.trigger('update');
    },

    render: function(){

        window.stroll.unbind(this.el);

        this.$el.html('');

        this.collection.each(function(truck){
            var truckView = new FoodTruckItemView({
                model: truck,
                gMap: this.gMap
            });
            this.$el.append(truckView.render().el); // calling render method manually..
        }, this);

        _.delay(function(){
            window.stroll.bind(this.el);
        }.bind(this), 1000);

        return this; // returning this for chaining..
    }

});

var FoodTruckItemView = Backbone.View.extend({

    tagName: 'li',

    model: null,

    gMap: null,

    initialize: function(options){
        this.model.bind('change', this.render);
        this.gMap = options.gMap;
        this.$el.bind('click', function(){
            var marker = this.gMap.getMarker(this.model.get("cnn")),
                template = _.template($('#infoTemplate').html());
            this.gMap.showInfoWindow(marker, template(this.model.toJSON()));
        }.bind(this));

    },

    template: function(){
        return _.template($('#truckTemplate').html());
    },

    render: function(){
        this.$el.html( this.template()(this.model.info()));
        return this;  // returning this from render method..
    }

});
