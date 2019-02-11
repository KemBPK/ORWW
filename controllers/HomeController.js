'use strict';

module.exports = function(app, yelp) {

    var search; 

    app.get('/Home/Welcome', function (req, res) {        
        res.render('./Home/Welcome'); //relative to the root view folder
    })

    app.get('/Home/Search', function (req, res) {
        const input = {
            term:'Onion Rings',
            location: req.query.city + ", " + req.query.state,
            limit: 50
          };
        search = yelp.SearchPlaces(input);

        res.render('./Home/Search', {
            input: input,
            result: search
        });
        //   search.then(function(response){
        //     console.log(response.jsonBody);
        //   });
    })
    
    app.post('/Home/get_input', function (req, res) {
        var input = req.body.input //post parameter
        console.log(input);
        res.redirect('./Welcome'); //relative to the view folder
    })
}