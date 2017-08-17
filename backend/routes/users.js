var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Twitter = require('twitter');
var TwitterConfig = require('../config/twitter');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/connect/:id', function (req, res, next) {
  if (req.params.id === undefined) {
    res.send('Id not found');
  } else {
    User
      .findOne({
        id: req.params.id
      }, function (err, record) {
        if (err) 
          res.send(err);
        
        if (record === null) {
          res.send({err: "Record not found"});
        } else {
          res.send(record);
        }
      });
  }
});

router.get('/tweets/:id', function (req, res, next) {
  if (req.params.id === undefined) {
    res.send('Id not found');
  } else {
    User
      .findOne({
        id: req.params.id
      }, function (err, record) {
        if (err) 
          res.send(err);
        
        if (record === null) {
          res.send({err: "Record not found"});
        } else {
          // If we don't have any issues/erros. Go ahead to next step
          getTweets(record);
        }
      });

    function getTweets(user) {
      var client = new Twitter({consumer_key: TwitterConfig.consumerKey, consumer_secret: TwitterConfig.consumerSecret, access_token_key: user.detail.token, access_token_secret: user.detail.tokenSecret});
      var params = {
        screen_name: user.detail.profile.username
      };
      client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
          res.send(tweets);
        } else {
          res.send(error);
        }
      });
    }
  }
});

router.get('/tweets/delete/:id', function (req, res, next) {
  User
    .remove({
      id: req.params.id
    }, function (err, record) {
      if (err) {
        res.send(err)
      } else {
        res.send(record);
      }
    });
});

module.exports = router;
