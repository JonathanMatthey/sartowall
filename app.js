/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
var PostProvider = require('./postprovider-mongodb').PostProvider;
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

// var postProvider= new PostProvider();
var postProvider = new PostProvider('localhost', 27017);

app.get('/', function(req, res){
    postProvider.findAll( function(error,docs){
      // console.log(docs);
        res.render('index.jade', { 
            title: 'sartowall',
            posts:docs
        });
    })
});

app.get('/color/r/:r/g/:g/b/:b', function(req, res){
   var  r = parseInt(req.params.r,10),
        g = parseInt(req.params.g,10),
        b = parseInt(req.params.b,10);

    var colorAccuracy = 1;

    postProvider.find(
      {
        "photos.colors.r": {$gt:r-colorAccuracy, $lt:r+colorAccuracy},
        "photos.colors.g": {$gt:g-colorAccuracy, $lt:g+colorAccuracy},
        "photos.colors.b": {$gt:b-colorAccuracy, $lt:b+colorAccuracy}
      },function(err, posts){
        res.render('index.jade', { 
            title: 'sartowall',
            posts:posts,
            r:r,
            g:g,
            b:b
        });
    });
});

app.get('/blog/new', function(req, res) {
    res.render('blog_new.jade', { 
        title: 'New Post'
    
    });
});

app.post('/blog/new', function(req, res){
    postProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/blog/:id', function(req, res) {
    postProvider.findById(req.params.id, function(error, photo) {
        res.render('blog_show.jade',
        { 
            title: photo.title,
            photo:photo
        }
        );
    });
});

app.post('/blog/addComment', function(req, res) {
    postProvider.addCommentToArticle(req.param('_id'), {
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
