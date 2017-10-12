var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var Group = require('../models/group');
// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});


router.post('/register', function(req, res){
	
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var phone_no = req.body.phone_no;
	var email = req.body.email;
	var password = req.body.password;
	var confirm_password = req.body.confirm_password;

	// Validation
	req.checkBody('confirm_password', 'Passwords do not match').equals(req.body.password);
	req.checkBody('first_name','first name should contain only alphabets ').isAlpha();
	req.checkBody('last_name','last name should contain only alphabets ').isAlpha();
	req.checkBody('phone_no','phone no must be numericals').notEmpty().isInt();

	var errors = req.validationErrors();
	

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			first_name : req.body.first_name,
            last_name : req.body.last_name,
            phone_no : req.body.phone_no,
            email : req.body.email,
            password : req.body.password
		});

		console.log(newUser);
		User.createUser(newUser, function(err, user){
			if(err){
				console.log('ERROR');
                res.render('register',{
                    errors:err});
            }
			else{
                req.flash('success_msg', 'You are registered and can now login');

                res.redirect('/');
			}

			console.log(user);
		});


	}
});

router.post('/addgroup', function(req, res){
	
	var group_name = req.body.group_name;
	var group_description = req.body.group_description;
    console.log(req);
    console.log(group_name);
    console.log(group_description);

    var newgroup = new Group({
        name: req.body.group_name,
        description: req.body.group_description,
        owner : req.user.id,
        members :[req.user.id]
    });
    console.log(newgroup);
    Group.createGroup(newgroup, function(err, group){
        if(err){
            console.log('ERROR' + err);
           // res.render('register',{
            //  errors:err});
            req.flash('error_msg', 'Please make sure that groupname alredy dose not exists.');
            res.redirect('/');
        }
        else{
            console.log(group);
            User.findOneAndUpdate({_id: req.user.id}, {$addToSet: {groups: group._id}},function(err,model){
                if(err){

                    console.log(err);
                }else{
                    console.log(model);

                }

            });
            req.flash('success_msg', 'You have successfully craeted a  new group');
            res.redirect('/');
        }

    });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {

    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You have successfully logged out');

	res.redirect('/users/login');
});


router.post('/addMember', function(req, res){

    var group_name = req.body.group_name;
    var member_email = req.body.member_email;
   console.log(req.user.id);
   console.log(group_name);
   console.log(member_email);
    Group.getGroupbyname(req.body.group_name,req.user.id, function(err, mygroup){
        if(err){
            console.log(err);
            req.flash('error_msg', 'Something went wrong.Try again.');
            res.redirect('/');
        }
        if(mygroup===null){
            console.log('ERROR group not found');
            req.flash('error_msg', 'No such group');
            res.redirect('/');
        }
        else{
            console.log(mygroup);
            User.findOneAndUpdate({email : req.body.member_email}, {$addToSet: {groups: mygroup._id}},function(err,model){
                if(err ){
                    console.log(err);
                    //res.render('register',{
                      //  errors:err});
                    req.flash('error_msg', 'Something went wrong. Try again');
                    res.redirect('/');
                }else  if(model===null){
                    console.log('ERROR:: User not found ');
                    req.flash('error_msg', 'No such user');
                    res.redirect('/');

                }else{
                    console.log(model);
                    Group.findOneAndUpdate({_id: mygroup._id}, {$addToSet: {members: model._id}},function(err,mygroup){
                        if(err){
                            req.flash('error_msg', 'Member cannot be added to group');
                            res.redirect('/');
                            console.log(err);
                        }else{
                            console.log(mygroup);
                            req.flash('success_msg', 'Member added to group');
                            res.redirect('/');
                        }
                    });
                }
            });


        }
    });
});

module.exports = router;