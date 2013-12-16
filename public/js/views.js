// The main view of the application
var FoodTruckView = Backbone.View.extend({

    // Base the view on an existing element
    el: $('#main'),

    gMap: null,

    //FoodTruckList collection
    collection: null,

     //Initialize to make the Application active
    initialize: function(options){

        // Set the container element
        this.setElement(this.el);

        //Referece to global gMap instance
        this.gMap = options.gMap;

        //Register Search key events
        this.handleSearch();

        //Backbone listeners to handle async ops
        this.registerListeners();

        //Initialize truck list view
        this.truckListView = new FoodTruckListView({
            collection: new FoodTruckList(),
            gMap: this.gMap
        });

        //Render the empty list to start with
        this.render();

        //Cache the markers
        this._markerHash = {};

    },

    //All records in the collection
    all: function(){
        return this.collection.all();
    },

    //Filter the collection by both 'text' and distance
    filterResults: function(text, distance){
        return this.collection.filterResults(text, distance);
    },

    //Update the distance across the collection
    updateDistance: function(lat, long){
        this.collection.update(lat, long, this.gMap.distance);
    },

    //Update the listView with the filtered models
    updateList: function(searchText, distance){

        var list;
        if(!searchText && !distance){
            list = this.all();
        }else{
            list = this.filterResults(searchText, distance);
        }

        return this.truckListView.update(list);
    },

    //Update Location and recalculate distances for all the markers
    updateLocation: function(){
        if(this.gMap.locMarker){
            var location = this.gMap.getLocation();
            this.updateDistance(location.lat, location.long);
        }
    },

    //search handler
    searchAction: function(){

        var distanceVal = $('#search-range').val() / 10,
            searchText  = $('#search-textbox').val();

        this.updateList(searchText, distanceVal);
    },

    //Register DOM events to perform search
    handleSearch: function(){
        $('#search-textbox').bind('keyup', this.searchAction.bind(this));
        $('#search-textbox-btn').bind('click', this.searchAction.bind(this));
        $('#search-range').bind('input change', function(){
            $('#distance-val').html($('#search-range').val() / 10);
            this.searchAction();
        }.bind(this));
    },

    //Render container and populate listview
    render: function(){

        //Clear and then render()
        $('#search-results').html('')
            .append(this.truckListView.render().el);

        return this;
    },


    //register listeners
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

    //Add a single record to the Google Map
    addOne: function( foodTruck ) {
        var template = _.template($('#infoTemplate').html());

        var marker = this.gMap.addResult({
            id: foodTruck.get("cnn"),
            lat: foodTruck.get('latitude'),
            long: foodTruck.get('longitude'),
            content: template(foodTruck.info())
        });
    },

    //Add all records to the Google Map
    addAll: function() {
        this.collection.each(function(truck){
            this.addOne(truck);
        }.bind(this));
    }

});

//FoodTruck Collection list view
var FoodTruckListView = Backbone.View.extend({

    tagName: 'ul',

    className: 'list-unstyled fan oAuto',

    collection: null,

    gMap: null,

    initialize: function(options){
        //On collection update, lets render the html
        this.on('update', this.render);
        this.gMap = options.gMap;

    },

    //On update, reset and sort the collection
    update: function(models){
        this.collection.reset(models);
        this.collection.sort();
        this.trigger('update');
    },

    //Render UI
    render: function(){

        //Stroll Effect ( unbind first as we are resetting the list on every refresh )
        window.stroll.unbind(this.el);

        //Clear the container
        this.$el.html('');

        //Render the collection
        this.collection.each(function(truck){
            var truckView = new FoodTruckItemView({
                model: truck,
                gMap: this.gMap
            });
            this.$el.append(truckView.render().el); // calling render method manually..
        }, this);

        //Stroll Effect ( on timeout as it could freeze the UI at busy browsers )
        _.delay(function(){
            window.stroll.bind(this.el);
        }.bind(this), 1000);

        return this; // returning this for chaining..
    }

});

//FoodTruck item view
var FoodTruckItemView = Backbone.View.extend({

    tagName: 'li',

    model: null,

    gMap: null,

    //Add all necessary listeners and event handlers
    initialize: function(options){
        this.model.bind('change', this.render);
        this.gMap = options.gMap;
        this.$el.bind('click', function(){
            //On Click, show the information window in Google Maps
            var marker = this.gMap.getMarker(this.model.get("cnn")),
                template = _.template($('#infoTemplate').html());
            this.gMap.showInfoWindow(marker, template(this.model.toJSON()));
        }.bind(this));

    },

    //Item template as in index.html
    template: function(){
        return _.template($('#truckTemplate').html());
    },

    //Render item UI
    render: function(){
        this.$el.html( this.template()(this.model.info()));
        return this;  // returning this from render method..
    }

});
