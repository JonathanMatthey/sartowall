
/**
 * PHOTOPROVIDER-MONGODB.js
 */


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





/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
// var PhotoProvider = require('./photoprovider-mongodb').PhotoProvider;
// var PhotoProvider = require('./photoprovider-memory').PhotoProvider;
var app = express();
// var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

// var photoProvider= new PhotoProvider();
var photoProvider = new PhotoProvider('localhost', 27017);

app.get('/', function(req, res){
    photoProvider.findAll( function(error,docs){
      console.log(docs);
        res.render('index.jade', { 
            title: 'sartowall',
            photos:docs
        });
    })
});

app.get('/blog/new', function(req, res) {
    res.render('blog_new.jade', { 
        title: 'New Post'
    
    });
});

app.post('/blog/new', function(req, res){
    photoProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/blog/:id', function(req, res) {
    photoProvider.findById(req.params.id, function(error, photo) {
        res.render('blog_show.jade',
        { 
            title: photo.title,
            photo:photo
        }
        );
    });
});

app.post('/blog/addComment', function(req, res) {
    photoProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'))
       });
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(500, 'Something broke!');
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode",  port, app.settings.env);
});



