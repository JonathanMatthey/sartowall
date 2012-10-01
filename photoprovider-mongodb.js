var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

PhotoProvider = function(host, port) {
  this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};


PhotoProvider.prototype.getCollection= function(callback) {
  this.db.collection('photos', function(error, photo_collection) {
    if( error ) callback(error);
    else callback(null, photo_collection);
  });
};

PhotoProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, photo_collection) {
      if( error ) callback(error)
      else {
        photo_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


PhotoProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, photo_collection) {
      if( error ) callback(error)
      else {
        photo_collection.findOne({_id: photo_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

PhotoProvider.prototype.save = function(photos, callback) {
    this.getCollection(function(error, photo_collection) {
      if( error ) callback(error)
      else {
        if( typeof(photos.length)=="undefined")
          photos = [photos];

        for( var i =0;i< photos.length;i++ ) {
          photo = photos[i];
          photo.created_at = new Date();
          if( photo.comments === undefined ) photo.comments = [];
          for(var j =0;j< photo.comments.length; j++) {
            photo.comments[j].created_at = new Date();
          }
        }

        photo_collection.insert(photos, function() {
          callback(null, photos);
        });
      }
    });
};

exports.PhotoProvider = PhotoProvider;