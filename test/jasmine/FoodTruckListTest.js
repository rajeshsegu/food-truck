
describe('FoodTruck Model', function(){

    var foodTruckList,
        foodTrucks =  [{
            'location' : {
                'needs_recoding' : false,
                'longitude' : '-122.398658184594',
                'latitude' : '37.7901490874965'
            },
            'status' : 'REQUESTED',
            'expirationdate' : '2013-03-15T00:00:00',
            'permit' : '13MFF-0068',
            'block' : '3708',
            'received' : 'Mar 14 2013  3:34PM',
            'facilitytype' : 'Truck',
            'blocklot' : '3708055',
            'locationdescription' : '01ST ST: STEVENSON ST to JESSIE ST (21 - 56)',
            'cnn' : '101000',
            'priorpermit' : '0',
            'schedule' : 'http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=13MFF-0068&ExportPDF=1&Filename=13MFF-0068_schedule.pdf',
            'address' : '50 01ST ST',
            'applicant' : 'Cupkates Bakery, LLC',
            'lot' : '055',
            'fooditems' : 'Cupcakes',
            'longitude' : '-122.398658184604',
            'latitude' : '37.7901490737255',
            'objectid' : '427856',
            'y' : '2115738.283',
            'x' : '6013063.33'
        },
            {
                'location' : {
                    'needs_recoding' : false,
                    'longitude' : '-122.395881037809',
                    'latitude' : '37.7891192216837'
                },
                'status' : 'APPROVED',
                'expirationdate' : '2014-03-15T00:00:00',
                'permit' : '13MFF-0060',
                'block' : '3720',
                'received' : 'Mar 14 2013 12:50PM',
                'facilitytype' : 'Truck',
                'blocklot' : '3720008',
                'locationdescription' : '01ST ST: NATOMA ST to HOWARD ST (165 - 199)',
                'cnn' : '106000',
                'priorpermit' : '0',
                'approved' : '2013-06-06T17:05:20',
                'schedule' : 'http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=13MFF-0060&ExportPDF=1&Filename=13MFF-0060_schedule.pdf',
                'address' : '400 HOWARD ST',
                'applicant' : 'Cheese Gone Wild',
                'lot' : '008',
                'fooditems' : 'Grilled Cheese Sandwiches & Bakery',
                'longitude' : '-122.395881037818',
                'latitude' : '37.7891192079118',
                'objectid' : '427795',
                'y' : '2115347.095',
                'x' : '6013858.06'
            },
            {
                'location' : {
                    'needs_recoding' : false,
                    'longitude' : '-122.394594036195',
                    'latitude' : '37.7879001115912'
                },
                'status' : 'APPROVED',
                'expirationdate' : '2014-03-15T00:00:00',
                'permit' : '13MFF-0063',
                'block' : '3737',
                'received' : 'Mar 14 2013  2:35PM',
                'facilitytype' : 'Truck',
                'blocklot' : '3737012',
                'locationdescription' : '01ST ST: CLEMENTINA ST to FOLSOM ST (245 - 299)',
                'cnn' : '110000',
                'priorpermit' : '1',
                'approved' : '2013-03-19T14:01:19',
                'schedule' : 'http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=13MFF-0063&ExportPDF=1&Filename=13MFF-0063_schedule.pdf',
                'address' : '245 01ST ST',
                'applicant' : 'Mini Mobile Food Catering',
                'lot' : '012',
                'fooditems' : 'Cold Truck: Corn Dogs: Noodle Soups: Candy: Pre-packaged Snacks: Sandwiches: Chips: Coffee: Tea: Various Beverages',
                'longitude' : '-122.394594036205',
                'latitude' : '37.7879000978181',
                'objectid' : '427837',
                'y' : '2114895.75',
                'x' : '6014220.898'
            }];

    beforeEach(function(){
        foodTruckList =  new FoodTruckList(foodTrucks);
        var distanceCounter = 1;
        foodTruckList.update(1, 2, function(){
            return distanceCounter++;
        });
    });

    it('should have all the 3 records', function() {
        expect(foodTruckList.size()).toEqual(3);
        expect(foodTruckList.all().length).toEqual(3);
    });

    it('should search across records', function() {
        expect(foodTruckList.search('').length).toEqual(3);
        expect(foodTruckList.search('Cold').length).toEqual(1);
        expect(foodTruckList.search('Bakery').length).toEqual(2);
    });

    it('should calculate distance', function(){
        foodTruckList.each(function(foodTruck){
            expect(foodTruck.get("distance")).toBeDefined();
        });
    });

    it('should be able to filter by distance', function() {

        expect(foodTruckList.filterByDistance(0.5).length).toEqual(0);
        expect(foodTruckList.filterByDistance(1).length).toEqual(1);
        expect(foodTruckList.filterByDistance(2).length).toEqual(2);
        expect(foodTruckList.filterByDistance(3).length).toEqual(3);
    });

    it('should be sorted by distance', function() {
        var tmpDistance;

        expect(foodTruckList.sort).toBeDefined();
        foodTruckList.sort();

        tmpDistance = 0;
        foodTruckList.each(function(foodTruck){
            expect(foodTruck.get("distance")).toBeGreaterThan(tmpDistance);
            tmpDistance = foodTruck.get("distance");
        });
    });

    it('should be able to search by both text and distance', function() {

        expect(foodTruckList.filterResults('Bakery', 1).length).toEqual(0);
        expect(foodTruckList.filterResults('Bakery', 2).length).toEqual(1);
        expect(foodTruckList.filterResults('Cupcakes', 2).length).toEqual(0);
        expect(foodTruckList.filterResults('Catering', 2).length).toEqual(1);

    });

});



