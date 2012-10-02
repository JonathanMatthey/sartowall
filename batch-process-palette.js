var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var nodeio = require('node.io');
var options = {timeout: 10};

var cursor;

var palette = require('palette')
  , Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas
  , ctx = canvas.getContext('2d');

var mydb;

exports.job = new nodeio.Job(options, {
  input: ['hello'],
  run: function (keyword) {
    var self = this, results;

    // connect to DB
    mydb = new Db('node-mongo-blog', new Server('localhost', 27017, {auto_reconnect: true}, {}));
    mydb.open(function(){
      console.log('open');

      mydb.collection('photos', function(error, photo_collection){

        cursor = photo_collection.find({}, {}).limit(3);

        processNextPhoto();
      });
    });
  }
});

function processNextPhoto(){
  cursor.nextObject(function(err, photo) {

    if(err) throw err;

    if(photo !== null){
      console.log ('paletting this img' + photo.src);
      paletteImg(photo);
    }
    else {
      mydb.close();
      self.emit('done!2');
    }
  });
}

function paletteImg(photo){

  var img = new Image;
  console.log('in paletteImg');
  img.onload = function(){
    canvas.width = img.width;
    canvas.height = img.height + 50;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    console.log('in img.onload');

    var x = 0;
    var colors = palette(canvas, n);
    colors.forEach(function(color){
      var r = color[0]
        , g = color[1]
        , b = color[2]
        , val = r << 16 | g << 8 | b
        , str = '#' + val.toString(16);
        console.log("color:" + str);
      // ctx.fillStyle = str;
      // ctx.fillRect(x += 31, canvas.height - 40, 30, 30);
    });
    processNextPhoto();
    console.log('processNextPhoto(cursor)');
    // save();
  };

  img.src = photo.src;
  console.log(' waiting to load ' + photo.src ) ;
}

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

// load photo collection from mongodb

// var img = new Image;

// img.onload = function(){
//   canvas.width = img.width;
//   canvas.height = img.height + 50;
//   ctx.fillStyle = 'white';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   ctx.drawImage(img, 0, 0);
//   paintPalette();
//   save();
// };


// img.src = path;

// function paintPalette() {
//   var x = 0;
//   var colors = palette(canvas, n);
//   colors.forEach(function(color){
//     var r = color[0]
//       , g = color[1]
//       , b = color[2]
//       , val = r << 16 | g << 8 | b
//       , str = '#' + val.toString(16);
//       console.log("color:" + str);
//     ctx.fillStyle = str;
//     ctx.fillRect(x += 31, canvas.height - 40, 30, 30);
//   });
// }

// function save() {
//   fs.writeFile(out, canvas.toBuffer(), function(err){
//     if (err) throw err;
//     console.log('saved %s', out);
//   });
// }