var assert = require('assert');
var User = require('../models/User');
var TwitterConfig = require('../config/twitter');
var mongoose = require('mongoose');

describe("User", function () {
  describe("#findOne() for finding user then create or update the information of user", function () {
    this.timeout(15000);
    it("Should save without error", function (done) {
      mongoose
        .connect("mongodb://itanhduy:anhduytn123@ds021016.mlab.com:21016/twitter", function (err, database) {
          if (err) 
            return console.error(err);
          console.info("Connected to Mongo");
          // the Mongo driver recommends starting the server here because most apps
          // *should* fail to start if they have no DB.  If yours is the exception, move
          // the server startup elsewhere.
          User.findOne({
            id: TwitterConfig.twitterResponse.id
          }, function (err, record) {
            if (err) 
              done(err);
            if (record === null) {
              var newUser = User({id: TwitterConfig.twitterResponse.id, detail: TwitterConfig.twitterResponse.detail});
              newUser.save(function (err) {
                if (err) {
                  done(err);
                } else {
                  done();
                }
              });
            } else {
              User
                .update({
                  id: TwitterConfig.twitterResponse.id
                }, {
                  $set: {
                    detail: TwitterConfig.twitterResponse.detail
                  }
                }, function (err, record) {
                  if (err) 
                    done("Updated fail");
                  done();
                })
            }
          });
        });
    });
  });
});