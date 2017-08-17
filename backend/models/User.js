var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var userSchema = new Schema({id: String, detail: Object});
 // the schema is useless so far we need to create a model using it
 var User = mongoose.model('User', userSchema);
 module.exports = User;