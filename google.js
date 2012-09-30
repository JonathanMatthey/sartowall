var nodeio = require('node.io');
var options = {timeout: 10};

exports.job = new nodeio.Job(options, {
  input: ['hello'],
  run: function (keyword) {
    var self = this, results;
    // this.getHtml('http://www.google.com/search?q=' + encodeURIComponent(keyword), function (err, $) {
    this.getHtml('www.thesartorialist.com', function (err, $) {
      var photos = [];
      $('.size-full').each(function(image){
        photos.push(image.attribs.src);
      });
      this.emit(photos);
    });
  }
});
