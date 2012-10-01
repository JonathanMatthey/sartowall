/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
var PhotoProvider = require('./photoprovider-mongodb').PhotoProvider;
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

app.listen(3000, function(){
  console.log("Express server listening on port 3000 in %s mode",  app.settings.env);
});

console.log('Listening on port 3000');


