var nodeio = require('node.io')



nodeio.start('scraper-manrep.js', {}, 
function(err, output){
  console.log('callback - MANREP - done ');
  process.exit(code=0)
}
, false);

nodeio.start('scraper-lookbooknu.js', {}, 
function(err, output){
  console.log('callback - lookbook - done ');
  process.exit(code=0)
}
, false);
