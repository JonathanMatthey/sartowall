// heroku connect
var mongo = require('mongodb');
var database = null;

// local connect
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var moment = require('moment');

var nodeio = require('node.io');
var options = {benchmark: true, max: 1, timeout: 10};
var http = require('http')
  , url = require('url');

var mydb;

// var palette = require('palette')
//   , Canvas = require('canvas');

// var outCanvas = new Canvas(1000, 750);
// var ctx = outCanvas.getContext('2d');

var async = require('async');

var runOptions;

exports.job = new nodeio.Job(options, {
  input: function(start, num, callback) {
    var self = this;

    // heroku connect
    if (process.env.MONGOLAB_URI !== undefined ){

      var mongostr = process.env.MONGOLAB_URI;

      mongo.connect(mongostr, {}, function(error, db)
      {       
        console.log('error');
        console.log(error);
        console.log('db');
        console.log("connected, db: " + db);

        mydb = db;

        mydb.addListener("error", function(error){
          console.log("Error connecting to MongoLab");
        });

        inputProcessing(self,start, num, callback);

      });
    }
    else{
      // local connect
      mydb= new Db('node-mongo-blog', new Server('localhost', 27017, {auto_reconnect: true}, {}));
        mydb.open(function(){
        inputProcessing(self,start, num, callback);
      });
    }
  }, 
  run: function (options) {

    var self = this;

    this.getHtml(options.url, function(err, $) {
      if (err) {
        console.log("ERROR", err);
        self.retry();
      }
      else {
        mydb.collection('posts', {}, function(error, postCollection) {
          if( error ) callback(error);
          else {
            var post = {};
            post.photos = [];
            post.comments = [];

            post.url = options.url;

            // scrape comments function
            try
            {
              post.title = $(options.titleSelector).fulltext;
            }
            catch(err)
            {
            }

            // scrape comments function
            try
            {
              $(options.commentSelector).each(function(comment){
                post.comments.push({ "body": stripOutURL(comment.text)});
              });
            }
            catch(err)
            {
            }

            post.photos = [];

            $(options.photoSelector).each(function(img){
              // post.photos.push({src:img.attribs.src});
                post.photos.push({src:img.attribs.src});
            });
            // Update the document using an upsert operation, ensuring creation if it does not exist
            postCollection.update({_id: post._id}, post, {upsert:true, safe:true}, function(err, result) {
              process.stdout.write(".");
              self.emit('done !');
            });
          }
        });
      }
    });
  },
  output: function (lines) {
    // write_stream.write(lines.join('\n'));
    // console.log('OUTPUT: reached ');
    // mydb.close();
  }
});

function inputProcessing(self,start, num, callback){

  if(start !== 0) return false; // We only want the input method to run once

  mydb.collection('blogs', {}, function(error, blogCollection) {
    if( error ) callback(error);
    else {
      cursor = blogCollection.find({});
      cursor.nextObject(function(err, blog) {
        if(err) throw err;

        if(blog !== null){ 

          var postsUrlToScrape = [];

          mydb.collection('posts', {}, function(error, postCollection) {
            if( error ) callback(error);
            else {
              // recursively extract all posts URLs by traversing through OLDER POSTS / NEXT PAGE link on each page until you find a post you already have
              // returns all postsUrls to scrape in postUrlToScrape
              scrapeNewPostUrls(self, postCollection, blog.url, blog.nextPageSelector, postsUrlToScrape, function(postsUrlToScrape){
                
                var runOptions;
                console.log("%s - [ %d new posts ]", blog.name, postsUrlToScrape.length);
                for (i=0;i<postsUrlToScrape.length;i++){
                  runOptions = clone(blog);
                  runOptions.url = postsUrlToScrape[i];
                  callback([ runOptions ]);
                }
                callback(null,false);
              });
            }
          });

        }
        else {
          self.emit('NO MORE BLOGS - GO HOME !')
        }
      });
    }
  });
}

var clone = (function(){ 
  return function (obj) { Clone.prototype=obj; return new Clone() };
  function Clone(){}
}());

// recursively extract all posts URLs by traversing through OLDER POSTS / NEXT PAGE link on each page until you find a post you already have
// returns all postsUrls to scrape in param1 of callback
function scrapeNewPostUrls(self, postCollection, pageUrl, nextPageSelector, postsUrlToScrape, callback){

  self.getHtml(pageUrl, function (err, $) {
    if (err) self.exit(err);

    var postSelector = ".post-backlinks a";
    var postUrls = [];

    var findNewPostsFns = [];

    $(postSelector).each(function(postUrlObj){
      console.log(">"+postUrlObj.attribs.href);
      findNewPostsFns.push(function(callback){
        findNewPostsUrls(postCollection, postUrlObj.attribs.href, callback);
      });
    });

    async.parallel(
      findNewPostsFns,
      //  callback when all paletteFns completed
      function(err, results){
        var existingPostFound = false;
        for (i=0;i<results.length;i++){
          if (results[i] == null){
            existingPostFound = true;
          }
          else{
            postsUrlToScrape.push(results[i]);
          }
        }

        // if found an existing post - stop here, dont traverse to next page, just return all the posts you found so far
        if (existingPostFound){
          callback(postsUrlToScrape);
        }
        else{
          console.log(pageUrl);
          // keep traversing to next page of blog
          var nextPageUrl = $(nextPageSelector).attribs.href;

          scrapeNewPostUrls(self, postCollection, nextPageUrl, nextPageSelector, postsUrlToScrape,callback);
        }
      }
    );
  });
}

function findNewPostsUrls(postCollection, pageUrl, callback){
  postCollection.findOne({url: pageUrl}, function(error, result) {
    if( error ){
      console.log('error:' + pageUrl);
      console.log(error);
      callback(error);
    }
    else{
      if (result == null){
        // post not found - return to scrape later
        callback(null, pageUrl);
      }
      else{
        // post found, we already scraped it - return nothing
        callback(null, null);
      }
    }
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
