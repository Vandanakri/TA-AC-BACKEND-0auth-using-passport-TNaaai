var express = require('express'),
 router = express.Router(),
 mongoose = require('mongoose'),
 passport = require('passport')


var User = require('../models/User');

/* GET users listing. */

router.get('/', function (req, res, next) {
  console.log(req.session);
  res.render('users');
});

router.get('/register', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('register', { error });
});

router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    console.log(user, err, 'User Created');
    if (!user.email) {
      return res.redirect('login');
    }
    if (user.password <= 4) {
      return res.redirect('login');
    }
    res.redirect('login');
  });
});

// Route for handling login

router.get('/login', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('login', { error });
});

router.post('/login', (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res.redirect('/users/login');
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    // no user
    if (!user) {
      res.redirect('/users/login');
    }
    // password verification
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        return res.redirect('/users/login');
      }
      req.session.userId = user.id;
      res.redirect('/blogs');
    });
  });
});

// Logging in with github

router.get(
  '/users/login/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/users/login/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/users/login',
  }),
  async (req,res,next)=> {
    try {
      res.redirect('/blogs');
    } catch (error) {
      next(error);
    }
  }
)



// Logout

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;