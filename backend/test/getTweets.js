var assert = require('assert');
var User = require('../models/User');
var TwitterConfig = require('../config/twitter');
var Twitter = require('twitter');
var mongoose = require('mongoose');

describe("Tweet", function () {
  describe("Get tweets for user depends from Key, Token and Username", function () {
    it("Should return tweets", function (done) {
      this.timeout(15000);
      mongoose.connect("mongodb://itanhduy:anhduytn123@ds021016.mlab.com:21016/twitter", function (err, database) {
        if (err) 
          return console.error(err);
        if (TwitterConfig.twitterResponse.id === undefined) {
          done('Id not found');
        } else {
          User
            .findOne({
              id: TwitterConfig.twitterResponse.id
            }, function (err, record) {
              if (err) {
                done(err);
              }
              // If we don't have any issues/erros. Go ahead to next step
              getTweets(record);
            });
          function getTweets(user) {
            var client = new Twitter({consumer_key: TwitterConfig.consumerKey, consumer_secret: TwitterConfig.consumerSecret, access_token_key: TwitterConfig.twitterResponse.detail.token, access_token_secret: TwitterConfig.twitterResponse.detail.tokenSecret});
            var params = {
              screen_name: TwitterConfig.twitterResponse.detail.profile.username
            };
            client.get('statuses/user_timeline', params, function (error, tweets, response) {
              if (!error) {
                done();
              } else {
                done(error);
              }
            });
          }
        }
      });
    });
  });
});