var express = require('express');
var router = express.Router();
var passport = require('passport'),
  TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/User');
var TwitterConfig = require('../config/twitter');

passport.use(new TwitterStrategy({
  consumerKey: TwitterConfig.consumerKey,
  consumerSecret: TwitterConfig.consumerSecret,
  callbackURL: "http://127.0.0.1:3001/auth/twitter/callback"
}, function (token, tokenSecret, profile, done) {
  return done(null, {
    profile: profile,
    token: token,
    tokenSecret: tokenSecret
  });
}));

// Get oauth from twitter
router.get('/oauth_request', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/oauth_request'}), function (req, res) {
  // Successful authentication, redirect home. Because redirect to another domain
  // so we need to store in database again
  User
    .findOne({
      id: req.user.profile.id
    }, function (err, record) {
      if (err) 
        res.send(err);
      if (record === null) {
        var newUser = User({id: req.user.profile.id, detail: req.user});
        newUser.save(function (err) {
          if (err) {
            res.send(err);
          } else {
            console.info("Created  information for user");
            res.redirect('http://127.0.0.1:3000?id=' + req.user.profile.id);
          }
        });
      } else {
        User
          .update({
            id: req.user.profile.id
          }, {
            $set: {
              detail: req.user
            }
          }, function (err, record) {
            if (err) 
              res.send("Updated fail");
            console.info("Updated information for user");
            res.redirect('http://127.0.0.1:3000?id=' + req.user.profile.id);
          })
      }
    });
});
module.exports = router;