var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

var nodeio = require('node.io');
var options = {benchmark: true, max: 2, timeout: 10};
var http = require('http')
  , url = require('url');

var mydb;

var palette = require('palette')
  , Canvas = require('canvas');

var outCanvas = new Canvas(1000, 750);
var ctx = outCanvas.getContext('2d');

var async = require('async');

var runOptions;

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
                  console.log("- found " + postLinksCount + " posts");
                  console.log("- found " + $lastmodDates.length + " moddates");

                  // figure out if xml is ascending or descending
                  var firstDate = moment($lastmodDates[0].children[0].data);
                  var lastDate = moment($lastmodDates[$lastmodDates.length-1].children[0].data);
                  var lastScrapedDate = moment(blog.lastScrapedDate);

                  if (firstDate.diff(lastScrapedDate,'days') > 0 )
                  {
                    i = $lastmodDates.length-1;
                    // sitemap is in descending order

                  }

                  if (lastDate.diff(lastScrapedDate) >= 0 )
                  {
                    // sitemap is in ascending order
                    i = $lastmodDates.length-1;

                    // check for changes newer than last checked date for this blog
                    while( i >= 0 && lastDate.diff(lastScrapedDate) >= 0 ){

                      // // check if post 
                      // var url = $postLinks[i].children[0].data;
                      // postCollection.findOne({url: url}, function(error, result) {
                      //   if( error ) callback(error)
                      //   else{
                      //     if (result == null){

                      runOptions = clone(blog);
                      runOptions.url = $postLinks[i].children[0].data;
                      callback([ runOptions ]);
                      i--;
                      lastDate = moment($lastmodDates[i].children[0].data);
                    }
                  }
                  // update blog last modified date to now as we just checked it
                  blog.lastScrapedDate = moment().format("YYYY-MM-DDTHH:mm:ss z");
                  blogCollection.update({_id: blog._id}, blog, {safe:true}, function(err, result) {
                    console.log('= blog saved');
                    callback(null,false);
                  });

                });
              }
              else {
                self.emit('NO MORE BLOGS - GO HOME !')
              }
            });

          }
        });

      });

    }, 
    run: function (options) {

      var self = this;

      console.log("> scraping: " + options.url);

      this.getHtml(options.url, function(err, $) {
        if (err) {
          console.log("ERROR", err);
          self.retry();
        }
        else {

          mydb.collection('posts', {}, function(error, postCollection) {
          if( error ) callback(error);
          else {
            postCollection.findOne({url: options.url}, function(error, result) {
              if( error ) callback(error)
              else{
                if (result == null){
                  var post = {};
                  post.photos = [];
                  post.comments = [];
                }
                else
                {
                  var post = result;
                }
                post.url = options.url;

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

                    // Update the document using an upsert operation, ensuring creation if it does not exist
                    postCollection.update({_id: post._id}, post, {upsert:true, safe:true}, function(err, result) {
                      console.log('= post saved');
                      self.emit('done !');
                    });
                });
              }
            });
          }
          });
        }
      });
    },
    output: function (lines) {
      // write_stream.write(lines.join('\n'));
      mydb.close();
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
