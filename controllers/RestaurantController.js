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
    })

    app.post('/Restaurant/Search', function (req, res) {
        var id = req.body.id; //post parameter
        console.log(id);
        var alias = req.body.alias; //post parameter
        console.log(alias);

        db.restaurant.checkRestaurant(id,function(err, doesExist){
            if(err){
                console.log('caught error in checkRestaurant');
                res.redirect('/');
                return;
            }           
            if(doesExist){
                console.log('exists');
                //res.redirect
                res.redirect('/Restaurant?alias=' + alias);
                return;
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
                    result.name = result.name.replace('\'', '\\\'');
                    db.restaurant.insertRestaurant(result.id, result.name, result.alias, result.location.display_address, result.location.city, result.location.state,
                        result.location.zip_code, result.coordinates.latitude, result.coordinates.longitude, result.display_phone, result.url,
                        function(err){
                            if(err){
                                console.log('caught error in insertRestaurant');
                                res.redirect('/');
                                return;
                            }
                            console.log('inserted new restaurant');
                            res.redirect('/Restaurant?alias=' + alias);
                            return;
                        });
                }).catch(function(err){
                    console.log('SearchRestaurant error: ');
                    res.redirect('/');
                    return;
                });
            }
        })   
    })

    app.get('/Restaurant/', function (req, res) {
        var alias = req.query.alias;
        db.restaurant.getRestaurantInfoByAlias(alias, function(err, restaurant){
            if(err){
                console.log("error when calling getRestaurantInfoByAlias");
                res.status(404);
                res.render('./Error/404', { url: req.url });
                return;
            }
            res.render('./Restaurant/Profile',{
                profile: restaurant
            }); 
            return;
        })
         
    })

    app.post('/Restaurant/Rating', function (req, res) {
        console.log('calling Rating');
        var yelpID = req.body.id;
        db.restaurant.getRestaurantID(yelpID, function(err, restID){
            if(err){
                console.log("error when calling getRestaurantID");
                var rating = {
                    count: 0,
                    sum: 0
                };
                res.send(rating);
                return;
            }
            console.log('returning rating result');
            db.restaurant.getRatingSumAndCount(restID, function(err, count, sum){
                var rating = {
                    count: count,
                    sum: sum
                };
                res.send(rating);
                return;
            })

        }) 
    })
    
}