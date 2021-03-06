'use strict';

module.exports = function (app, yelp, db) {

    app.get('/User/Register', function (req, res) {
        res.render('./User/Register');
    })

    app.post('/User/Register', function (req, res) {
        ////console.log("test");
        //res.render('./User/Register');

        // POST parameters
        var fname = req.body.fname;
        var lname = req.body.lname;
        var email = req.body.email;
        var password = req.body.password;

        db.user.registerUser(email, password, fname, lname, function (err) {
            if (err) {
                //console.log("didn't work");
                res.redirect('/User/Register');
                return;
            }
            //console.log("worked");
            db.email.sendVerificationEmail(email, function(err){
                if(err){
                    //console.log(err);
                }
                res.render('./User/Verify');
                return;
            }) 
        })
    })

    app.post('/User/Register/CheckEmail', function (req, res) {
        var email = req.body.email;
        db.user.validateEmail(email, function (err, isValid) {
            if (err) {
                //console.log('Error when calling validateEmail');
                res.send(false);
                return;
            }
            if (isValid == true) {
                res.send(true);
                return;
            }
            else {
                res.send(false);
                return;
            }
        })
    })

    app.get('/User/Login', function (req, res) {
        res.render('./User/Login');
    })

    app.post('/User/Login', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        db.user.authenicateUser(email, password, function (err, isAuthenticated, isVerified) {
            if (err) {
                //console.log("email " + email + " not found");
                res.redirect('/User/Login');
                return;
            }
            if (isVerified == false){
                res.render('./User/Verify');
                return;
            }
            if (isAuthenticated == true) {
                db.user.getUserId(email, function (err, id) {
                    if (err) {
                        //console.log('Login failed');
                        res.redirect('/User/Login');
                        return;
                    }
                    req.session.id = id;
                    //console.log('Login succeeded');
                    res.redirect('/');
                    return;
                })
            }
            else {
                //console.log('Login failed');
                res.redirect('/User/Login');
                return;
            }

        })
    })

    app.post('/User/LoginNav', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        db.user.authenicateUser(email, password, function (err, isAuthenticated, isVerified) {
            if (err) {
                //console.log("email " + email + " not found");
                var account = { isLogged: false, isVerified: false };
                res.send(account);
                //res.redirect('/User/Login');
                return;
            }
            if (isAuthenticated == true && isVerified == true) {
                db.user.getUserId(email, function (err, id) {
                    if (err) {
                        //console.log('Login failed');
                        var account = { isLogged: false, isVerified: true, isAuthenticated: true};
                        res.send(account);
                        //res.redirect('/User/Login');
                        return;
                    }
                    req.session.id = id;
                    //console.log('Login succeeded');
                    var account = { isLogged: true, isVerified: true, isAuthenticated: true };
                    res.send(account);
                    //res.redirect('/');
                    return;
                })
            }
            else if(isAuthenticated == true && isVerified == false){
                var account = { isLogged: true, isVerified: false, isAuthenticated: true };
                res.send(account);
            }
            else {
                //console.log('Login failed');
                var account = { isLogged: false, isVerified: false, isAuthenticated: false };
                res.send(account);
                // res.redirect('/User/Login');
                return;
            }

        })
    })

    app.post('/User/Logout', function (req, res) {
        req.session = null;
        res.send(null);
        //res.redirect('/User/Login');
    })

    app.post('/User/GetUsername', function (req, res) {
        //console.log('called GetUsername');
        if (req.session.id) {
            db.user.getUsername(req.session.id, function (err, name) {
                if (err) {
                    var account = {
                        isLogged: false,
                    }
                    // return callback(JSON.stringify(account));
                    res.send(account);
                }
                //console.log('logged in');
                var account = {
                    isLogged: true,
                    username: name
                };
                res.send(account);
            })
        }
        else {
            //console.log('not logged in');
            var account = {
                isLogged: false,
            }
            res.send(account);
        }
    })

    app.get('/User/GetReviews', function (req, res) {
        //console.log('called getUserReviews');
        if (req.session.id) {
            db.user.getUserReviews(req.session.id, function (err, result) {
                if (err) {
                    res.redirect('/');
                    return;
                }
                res.render('./User/Reviews', {
                    reviews: result
                });
                return;
            })
        }
        else {
            res.redirect('/');
            return;
        }
    })

    app.get('/User/ChangePassword', function(req, res){
        if (req.session.id) {
            res.render('./User/ChangePassword');
            return;
        }
        else {
            res.redirect('/');
            return;
        }
    })

    app.post('/User/ChangePassword', function(req, res){
        if (req.session.id) {
            var oldPass = req.body.oldPass;
            var newPass = req.body.newPass;
            db.user.changePassword(req.session.id, oldPass, newPass, function(err, isChanged){
                if(err){
                    res.render('./User/ChangePassword', {
                        errMsg: "There was an error when contacting the database. Please try again."
                    });
                    return;
                }
                if(isChanged === false){
                    res.render('./User/ChangePassword', {
                        errMsg: "Please enter the correct old password."
                    });
                    return;
                }
                res.redirect('/');
                return;
            })  
        }
        else {
            res.redirect('/');
            return;
        }
    })

    app.post('/User/Verify', function(req, res){
        res.render('./User/Verify');
        return;
    })

    app.get('/User/Verify/:hash', function (req, res) {
        //console.log('checking');
        var hash = req.params.hash;
        db.email.verifyEmail(hash, function(err){
            if(err){
                //console.log(err);
                res.status(404);
                res.render('./Error/404', { url: req.url });
                return;
            }
            res.render('./User/AccountVerified');
            return;
        })
    })

    app.post('/User/ResendVerificationEmail', function(req, res){
        var email = req.body.email;
        db.user.getUserId(email, function(err, id){
            if(err){
                var result = { err: true, message: 'The email was not found.'};
                res.send(result);
                return
            }
            db.email.removeVerificationEmail(id, function(err){
                db.email.sendVerificationEmail(email, function(err){
                    if(err){
                        var result = { err: true, message: 'Failed to send verificaiton email. Please try again.' };
                        res.send(result);
                        return;
                    }

                    var result = { err: false};
                    res.send(result);
                    return;
                })
            })
        })
    })

}