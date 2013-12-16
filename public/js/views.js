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
            collection: new FoodTruckList()
        });

        this.render();

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

        //backup

        var list = searchText
            ? this.search(searchText) : this.all();
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
        this.gMap.addResult(foodTruck.get('latitude'), foodTruck.get('longitude'));
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

    initialize: function(){
        this.on('update', this.render);
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
            var truckView = new FoodTruckItemView({ model: truck });
            this.$el.append(truckView.render().el); // calling render method manually..
        }, this);

        _.delay(function(){
            window.stroll.bind(this.el);
        }.bind(this), 1000);

        return this; // returning this for chaining..
    }

});

function template(id){
    return _.template($('#'+id).html());
}

var FoodTruckItemView = Backbone.View.extend({

    tagName: 'li',

    model: null,

    initialize: function(){
        this.model.bind('change', this.render);
    },

    template: function(){
        return _.template($('#truckTemplate').html());
    },

    render: function(){
        this.$el.html( this.template()(this.model.toJSON()));
        return this;  // returning this from render method..
    }

});
