var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

var nodeio = require('node.io');
var options = {benchmark: true, max: 50, timeout: 10};
var http = require('http')
  , url = require('url');

var mydb;

var palette = require('palette')
  , Canvas = require('canvas');

var outCanvas = new Canvas(1000, 750);
var ctx = outCanvas.getContext('2d');

var async = require('async');

var runOptions;


// for each sitemap - 

  exports.job = new nodeio.Job(options, {
    input: function(start, num, callback) {
      var self = this;

      mydb = new Db('node-mongo-blog', new Server('localhost', 27017, {auto_reconnect: true}, {}));
      mydb.open(function(){

        if(start !== 0) return false; // We only want the input method to run once

        mydb.collection('blogs', {}, function(error, blogCollection) {
          if( error ) callback(error);
          else {
            cursor = blogCollection.find({});
            cursor.nextObject(function(err, blog) {
              if(err) throw err;

              if(blog !== null){ 

                self.getHtml(blog.sitemap, function (err, $) {
                  if (err) self.exit(err);

                  var $postLinks = $("loc");
                  var $lastmodDates = $("lastmod");
                  var postLinksCount = $postLinks.length;
                  var i;

                  // figure out if xml is ascending or descending

                  var date1 = moment($lastmodDates[0].children[0].data);
                  var date2 = moment($lastmodDates[1].children[0].data);
                  console.log(date1.diff(date2));
                  var sitemapOrder = (date1.diff(date2) > 0) ? "asc": "desc";
                  console.log(sitemapOrder);

                  console.log("- found " + postLinksCount + " posts");
                  for (i=postLinksCount - 1; i > postLinksCount - 4; i--){
                    runOptions = clone(blog);
                    runOptions.postUrl = $postLinks[i].children[0].data;
                    // console.log(blog);
                    callback([ runOptions ]);
                  }
                  callback(null, false);
                });

              }
              else {
                mydb.close();
                self.emit('JOB DONE - GO HOME !')
              }
            });

          }
        });

      });

    }, 
    run: function (options) {

      var self = this;

      console.log("> scraping: " + options.postUrl);

      this.getHtml(options.postUrl, function(err, $) {
        if (err) {
          console.log("ERROR", err);
          self.retry();
        }
        else {

          var post = {}; 
          post.photos = [];
          post.comments = [];

          // scrape comments function
          try
          {
            console.log('> found title: ' + $(options.titleSelector).fulltext);
            post.title = $(options.titleSelector).fulltext;
          }
          catch(err)
          {
          }

          // scrape comments function
          try
          {
            console.log('> found comments: ' + $(options.commentSelector).length);
            $(options.commentSelector).each(function(comment){
              post.comments.push({ "body": stripOutURL(comment.text)});
            });
          }
          catch(err)
          {
          }
          
          paletteFns = [];

          console.log("> found photos: " + $(options.photoSelector).length);
          $(options.photoSelector).each(function(img){
            // post.photos.push({src:img.attribs.src});
            paletteFns.push(function(callback){
              paletteImg(callback, {src:img.attribs.src});
            });
          });

          async.parallel(paletteFns,
          //  callback when all paletteFns completed
          function(err, results){
              // the results array will equal ['one','two'] even though
              // the second function had a shorter timeout.
              post.photos = results;
              // console.log(post);
              // savePost(function(){ console.log('post saved'); }, post);
              self.emit('done !');
          });

        }
      });
    },
    output: function (lines) {
      // write_stream.write(lines.join('\n'));
    }
  });

var clone = (function(){ 
  return function (obj) { Clone.prototype=obj; return new Clone() };
  function Clone(){}
}());

function paletteImg(callback, photo){

  var regexGroups = photo.src.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);

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
        callback(null, photo);
        // console.log(photo);

        // var out = fs.createWriteStream(__dirname + '/my-out.png')
        //   , stream = outCanvas.createPNGStream();

        // stream.on('data', function(chunk){
        //   out.write(chunk);
        // });
      });
    });
}

function stripOutURL(text) {

      //URLs starting with http://, https://, or ftp://
    var exp = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var replacedText = text.replace(exp, '');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    exp = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    return replacedText.replace(exp, '');

}

function getPosts(callback) {
  mydb.collection('posts', {}, function(error, post_collection) {
    if( error ) callback(error);
    else callback(null, post_collection);
  });
};

function savePost(callback, post){
  getPosts(function(error, post_collection) {
    if( error ) callback(error)
    else {
      post_collection.insert(post, function() {
        callback(null, post);
      });
    }
  });
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
