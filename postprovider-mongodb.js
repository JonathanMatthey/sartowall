// heroku connect
// var connect = require('connect');
var mongo = require('mongodb');
var database = null;

// local connect
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

PostProvider = function(host, port) {
  // heroku connect
  if (process.env.MONGOLAB_URI !== undefined ){

    var mongostr = process.env.MONGOLAB_URI;

    mongo.connect(mongostr, {}, function(error, db)
    {       
      console.log('error');
      console.log(error);
      console.log('db');
      console.log("connected, db: " + db);

      this.db = db;

      this.db.addListener("error", function(error){
        console.log("Error connecting to MongoLab");
      });
    });
  }
  else{
    // local connect
    this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true}, {}));
    this.db.open(function(){});
  }
};

PostProvider.prototype.getCollection= function(callback) {
  console.log('this.db:' );
  console.log(this.db);
  this.db.collection('posts', function(error, photo_collection) {
    if( error ) callback(error);
    else callback(null, photo_collection);
  });
};

PostProvider.prototype.findAll = function(callback) {
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

PostProvider.prototype.find = function(options, callback) {
  console.log(options);
  console.log('boom');
    this.getCollection(function(error, photo_collection) {
      if( error ) callback(error)
      else {
        photo_collection.find(options).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

PostProvider.prototype.findById = function(id, callback) {
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

PostProvider.prototype.save = function(photos, callback) {
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

exports.PostProvider = PostProvider;