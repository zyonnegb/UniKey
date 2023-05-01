module.exports = function(app, passport, db) {

  // normal routes ===============================================================
  
      // show the home page (will also have our login links)
      app.get('/', function(req, res) {
          res.render('index.ejs');
      });
      //route to render the create page
        app.get('/create', function(req, res) {
          res.render('create.ejs');
      });
          //route to render the delete page
      app.get('/delete', function(req, res) {
        res.render('delete.ejs');
      });
          //route to render the browse page
      app.get('/browse', function(req, res) {
      res.render('browse.ejs');
      });
  
      // PROFILE SECTION ========================= //displays content in dom BROWSE PAGE
      app.get('/profile', isLoggedIn, function(req, res) {
          db.collection('messages').find().toArray((err, result) => {
            if (err) return console.log(err)
            res.render('profile.ejs', {
              user : req.user,
              messages: result
            })
          })
      });
      //displays key in delete dropdown
      app.get('/delete', (req, res) => {
        db.collection('keys').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('delete.ejs', { keys: result })
        })
      })
      
      
  
      // LOGOUT ==============================
      app.get('/logout', function(req, res) {
          req.logout(() => {
            console.log('User has logged out!')
          });
          res.redirect('/');
      });
  
  // message board routes ===============================================================
  
      app.post('/messages', (req, res) => {
        db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0}, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
          res.redirect('/profile')
        })
      })
  // Saved Key To Database
      app.post('/save', (req, res) => {
        let feet = req.body.feet
        let inches = req.body.inches
        let lbs = req.body.lbs
        let key = `${feet}F${inches}I${lbs}LBS`
        db.collection('keys').save({feet: feet, inches: inches, lbs: lbs, key: key}, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
          res.redirect('/create')
        })
      })
  
      app.put('/messages', (req, res) => {
        db.collection('messages')
        .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
          $set: {
            thumbUp:req.body.thumbUp + 1
          }
        }, {
          sort: {_id: -1},
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
      })
      app.put('/messages/thumbDown', (req, res) => {
        db.collection('messages')
        .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
          $set: {
            thumbUp:req.body.thumbDown - 1
          }
        }, {
          sort: {_id: -1},
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
      })
  
      app.delete('/messages', (req, res) => {
        db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
          if (err) return res.send(500, err)
          res.send('Message deleted!')
        })
      })
  
  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================
  
      // locally --------------------------------
          // LOGIN ===============================
          // show the login form
          app.get('/login', function(req, res) {
              res.render('login.ejs', { message: req.flash('loginMessage') });
          });
  
          // process the login form
          app.post('/login', passport.authenticate('local-login', {
              successRedirect : '/profile', // redirect to the secure profile section
              failureRedirect : '/login', // redirect back to the signup page if there is an error
              failureFlash : true // allow flash messages
          }));
  
          // SIGNUP =================================
          // show the signup form
          app.get('/signup', function(req, res) {
              res.render('signup.ejs', { message: req.flash('signupMessage') });
          });
  
          // process the signup form
          app.post('/signup', passport.authenticate('local-signup', {
              successRedirect : '/profile', // redirect to the secure profile section
              failureRedirect : '/signup', // redirect back to the signup page if there is an error
              failureFlash : true // allow flash messages
          }));
  
  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future
  
      // local -----------------------------------
      app.get('/unlink/local', isLoggedIn, function(req, res) {
          var user            = req.user;
          user.local.email    = undefined;
          user.local.password = undefined;
          user.save(function(err) {
              res.redirect('/profile');
          });
      });
  
  };
  
  // route middleware to ensure user is logged in
  function isLoggedIn(req, res, next) {
      if (req.isAuthenticated())
          return next();
  
      res.redirect('/');
  }