var nodeio = require('node.io');

console.log('worker started');

nodeio.start('blog-scraper.js', {}, 
function(err, output){
  console.log('callback - MANREP - done ');
}
, false);
