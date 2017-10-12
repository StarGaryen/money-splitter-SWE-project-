var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
//var uniqueValidator = require('mongoose-unique-validator');


// Group Schema
var GroupSchema = mongoose.Schema({
        name:{
            type: String,
           // unique: true
        },
        description :{
            type: String
        },
        owner :{
            type: mongoose.Schema.Types.ObjectId , ref : 'User'
        },
        members :[mongoose.Schema.Types.ObjectId],
        bills:[{
            note :{
                type: String
            },
            partners: [{
                id : {
                    type: mongoose.Schema.Types.ObjectId , ref : 'User'
                },
                amount:{
                    type:Number
                    //,integer : true
                }
            }]
        }]
});
//GroupSchema.index({ "name": 1, "ownwer": 1}, { "unique": true });
//UserSchema.plugin(uniqueValidator);
var Group = module.exports = mongoose.model('Group', GroupSchema);

module.exports.createGroup = function(newGroup, callback){
    newGroup.save(callback);
}

module.exports.getGroupById = function(id, callback){
    Group.findById(id, callback);
}

module.exports.getGroupbyname = function(groupName,ownerid , callback){
   Group.findOne({name : groupName, owner: ownerid},callback);
}

