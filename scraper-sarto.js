var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var nodeio = require('node.io');
var options = {timeout: 10};

var mydb;

exports.job = new nodeio.Job(options, {
  input: ['hello'],
  run: function (keyword) {
    var self = this, results;
    // this.getHtml('http://www.google.com/search?q=' + encodeURIComponent(keyword), function (err, $) {
    this.getHtml('www.thesartorialist.com/page/4/', function (err, $) {
      var photos = [];
      $('.size-full').each(function(image){
        photos.push({ src: image.attribs.src });
      });

      // connect to DB
      mydb = new Db('node-mongo-blog', new Server('localhost', 27017, {auto_reconnect: true}, {}));
      mydb.open(function(){
        savePhotos(photos, function(error, photo_collection){
          if( error ) 
            console.log ('ERROR - do something ! couldnt save photos');
          else{
            mydb.close();
            self.emit(photo_collection);
          }
        });
      });
    });
  }
});

function getPhotos(callback) {
  mydb.collection('photos', function(error, photo_collection) {
    if( error ) callback(error);
    else callback(null, photo_collection);
  });
};

function savePhotos(photos, callback) {
  console.log('photos');
  console.log(photos);
    getPhotos(function(error, photo_collection) {
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