var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var nodeio = require('node.io');
var options = {timeout: 500}
  , http = require('http')
  , url = require('url');

var cursor;

var palette = require('palette')
  , Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas
  , ctx = canvas.getContext('2d');

var outCanvas = new Canvas(1000, 750);
var ctx = outCanvas.getContext('2d');

var mydb;

var self;

var postsCollection;

var totalPhotos = 0;
var photosProcessedCount = 0 ;
var photosToProcessArray = [];

exports.job = new nodeio.Job(options, {
  input: ['hello'],
  run: function (keyword) {
    self = this;

    // connect to DB
    mydb = new Db('node-mongo-blog', new Server('localhost', 27017, {auto_reconnect: true}, {}));
    mydb.open(function(){

      mydb.collection('posts', function(error, posts_collection){
        postsCollection = posts_collection;
        cursor = posts_collection.find({});
        cursor.count(function(err, count) {
          totalPhotos = count;
          processNextPhoto();
        });
      });
    });
  }
});

function processNextPost(){

  cursor.nextObject(function(err, post) {

    if(err) throw err;

    if(post !== null){
      photosToProcessArray = post.photos;
      processNextPhoto(post);
    }
    else {
      mydb.close();
      self.emit('JOB DONE - GO HOME !')
    }
  });

}

function processNextPhoto(post){
  if(photosToProcessArray.length !== 0){
    paletteImg(post, photosToProcessArray.pop());
  }
  else {
    // save post here 
    console.log(post);
    // move on to next post
    processNextPost();
  }
}

function paletteImg(post, photo){

  var regexGroups = photoUrl.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);

  var host = regexGroups[3]; 
  var path = regexGroups[4] + regexGroups[6];

  http.get(
    {
        host: host,
        port: 80,
        path: path
    },
    function(res) {
      var data = new Buffer(parseInt(res.headers['content-length'],10));
      var pos = 0;
      res.on('data', function(chunk) {
        chunk.copy(data, pos);
        pos += chunk.length;
      });
      res.on('end', function () {
        img = new Canvas.Image;
        img.src = data;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        // var x = 0;
        var colorsArray = [];
        var colors = palette(outCanvas, 5);
        colors.forEach(function(color){
          var r = color[0]
            , g = color[1]
            , b = color[2]
            , val = r << 16 | g << 8 | b
            , str = '#' + val.toString(16);
            colorsArray.push({"r" : r, "g" : g, "b" : b, "str" : str});
        });

        photo.colors = colorsArray;

        // console.log(photo);

        // var out = fs.createWriteStream(__dirname + '/my-out.png')
        //   , stream = outCanvas.createPNGStream();

        // stream.on('data', function(chunk){
        //   out.write(chunk);
        // });
      });
    }
);
}


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