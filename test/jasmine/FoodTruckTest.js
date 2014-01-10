
describe('FoodTruck Model', function(){

    var foodTruckObject;

    beforeEach(function(){
        foodTruckObject =  new FoodTruck({
            distance: 1,
            name: 'ABC',
            address: 'My Address'
        });
    });

    it('should expose attributes', function() {
        foodTruckObject.set('distance', 23);
        expect(foodTruckObject.get('distance')).toEqual(23);
    });

    it('should have core search methods', function(){
        expect(foodTruckObject.matchesApplicant).toBeDefined();
        expect(foodTruckObject.matchesFoodItems).toBeDefined();
    });

    it('should generate json info', function(){
        expect(foodTruckObject.info()).toEqual({
            distance: 1,
            name: 'ABC',
            address: 'My Address'
        });
    });

    it('should handle empty address', function(){
        foodTruckObject = new FoodTruck({
            distance: 1,
            name: 'ABC'
        });

        expect(foodTruckObject.info()).toEqual({
            distance: 1,
            name: 'ABC',
            address: 'No Address'
        });
    });


});



