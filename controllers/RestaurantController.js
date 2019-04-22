'use strict';

module.exports = function(app, yelp, db) {
    app.get('/Restaurant/Map', function (req, res) {
        var name = req.query.restaurant;
        name = name.replace(/[-]/g, ' ');
        name = name.replace(/[0-9]/g, '');
        const input = {
            restaurant: name.toUpperCase(),
            latitude: req.query.latitude,
            longitude: req.query.longitude 
          };
        res.render('./Partials/_map',{
            input: input
        });    
        //res.render('./Home/Welcome'); //relative to the root view folder
    });

    app.post('/Restaurant/Search', function (req, res) {
        var id = req.body.id; //post parameter
        console.log(id);
        var alias = req.body.alias; //post parameter
        console.log(alias);

        db.restaurant.checkRestaurant(id,function(doesExist){
            if(doesExist){
                console.log('exists');
                //res.redirect
                res.redirect('/Restaurant?alias=' + alias); 
            } 
            else {
                console.log('does not exists');

                var search = yelp.SearchRestaurant(id);               
                search.then(function(response){
                    //console.log(response.jsonBody);
                    return response.jsonBody;
                }).then(function(result){
                    //console.log(result);
                    result.name = result.name.replace('\'', '\\\'');
                    //console.log(result.name);
                    db.restaurant.insertRestaurant(result.id, result.name, result.alias, result.location.display_address, result.location.city, result.location.state,
                        result.location.zip_code, result.coordinates.latitude, result.coordinates.longitude, result.display_phone, result.url,
                        function(){
                            console.log('inserted new restaurant');
                            res.redirect('/Restaurant?alias=' + alias);
                        });
                });
            }
        });   
    });

    app.get('/Restaurant/', function (req, res) {
        var alias = req.query.alias;
        res.render('./Restaurant/Profile',{
            input: alias
        });  
    });


    
}