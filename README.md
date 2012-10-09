sartowall
=========

Sartorialist Node JS Experiment


Boom !


required modules ( add these to package file )
=========

npm install node.io
npm install mongodb



research:
hummingbird analytics ? 



TODO
========
Version 1
========

get scraper scheduled.
scrape posts.
palette images
scrape comments
host on heroku.

iphone - 3 column layout
iphone - 1 column layout

web... responsive column layout

full grid.
infinite scroll.

layout ? 
grid, comments appear in a box - bottom right... like GMAIL tasks.

or GO ULTRA ARTY....

PHOTO ONLY ... WHITE SPACE... COMMENTS WHERE ?

GO LIKE ARTSY / P8 / ITS ART AT THE END OF THE DAY.

- allow people to vote
- allow people to register
- save their preferred blogs



heroku deploy:

deploy:
    -heroku destroy --confirm sartowall
    -heroku create sartowall --stack cedar
    -heroku addons:add redistogo:nano
    -heroku addons:add custom_domains:basic
    -heroku addons:add zerigo_dns:basic
    -heroku domains:add mycoolapp.com
    -heroku domains:add www.mycoolapp.com
    -heroku config:add -s LD_PRELOAD='/app/node_modules/canvas/cairo/libcairo.so /app/node_modules/canvas/lib/libpixman-1.so.0 /app/node_modules/canvas/lib/libfreetype.so.6' --app sartowall
    -heroku config:add -s LD_LIBRARY_PATH'=/app/node_modules/canvas/cairo' --app sartowall
    -git push heroku master

config vars:

MONGOLAB_URI:  mongodb://heroku_app8069581:srooksrgtomq4alb2amqcnq25o@ds039037.mongolab.com:39037/heroku_app8069581





//    div.selected-color(style="background-color:rgb(" + r + "," + g + "," + b + ")")

//              a.colorway(r=photo.colors[0].r,g=photo.colors[0].g,b=photo.colors[0].b,style="background-color:"+photo.colors[0].str)
//              a.colorway(r=photo.colors[1].r,g=photo.colors[1].g,b=photo.colors[1].b,style="background-color:"+photo.colors[1].str)
//              a.colorway(r=photo.colors[2].r,g=photo.colors[2].g,b=photo.colors[2].b,style="background-color:"+photo.colors[2].str)
//              a.colorway(r=photo.colors[3].r,g=photo.colors[3].g,b=photo.colors[3].b,style="background-color:"+photo.colors[3].str)
//              a.colorway(r=photo.colors[4].r,g=photo.colors[4].g,b=photo.colors[4].b,style="background-color:"+photo.colors[4].str)
NODE_ENV:      production
PATH:          bin:node_modules/.bin:/usr/local/bin:/usr/bin:/bin
SCHEDULER_URL: http://8dsf5gk50slrz46oy9ms02040@heroku-scheduler.herokuapp.com/



blog entry in mongo

 db.blogs.update({_id: ObjectId("5072e3f0e14ee244a185e87d")},{url:"http://atlantic-pacific.blogspot.com",sitemap:"atlantic-pacific.blogspot.com/sitemap.xml",nextPageSelector:".blog-pager-older-link",commentSelector:".comment-body p",titleSelector:".post-title",postSelector:".sIFR-alternate a",photoSelector:".post-body img", lastScrapedDate: "2012-09-01T19:20:59Z"})


 db.posts.insert({  "photos" : [{"src" : "http://1.bp.blogspot.com/-a1KbOU51ujg/UHHK85_-K-I/AAAAAAAAFts/b9CnJtGWwUk/s898/1FALL%2BPRINT%2B012.JPG"},{"src" : "http://2.bp.blogspot.com/-mdQbRFEtp5A/UHHLZCmyDPI/AAAAAAAAFt4/fh9e7r6DEh8/s600/1FALL%2BPRINT%2B042.JPG" },{"src" : "http://4.bp.blogspot.com/-8kwY7sTgzAc/UHHL3O1klRI/AAAAAAAAFuE/cqykstc5_Rg/s898/1FALL%2BPRINT%2B018.JPG"}  ],  "comments" : [  ],  "url" : "http://atlantic-pacific.blogspot.com/2012/10/weekend-rain.html#links",  "title" : "fall mix"})

db.blogs.insert(  { name:"thesartorialist.com",   "url" : "http://www.thesartorialist.com",    "sitemap" : "http://www.thesartorialist.com/sitemap.xml",    "nextPageSelector" : ".navigation .alignleft a",    "commentSelector" : ".content-comment p",    "titleSelector" : ".post h2",    "postSelector" : ".post h2 a",    "photoSelector" : ".size-full",    "lastScrapedDate" : "2012-09-01T19:20:59Z"  }  )

db.blogs.insert(    {   name:"atlantic-pacific.com",   "url" : "http://atlantic-pacific.blogspot.com",    "sitemap" : "atlantic-pacific.blogspot.com/sitemap.xml",    "nextPageSelector" : ".blog-pager-older-link",    "commentSelector" : ".comment-body p",    "titleSelector" : ".post-title",    "postSelector" : ".post-backlinks a",    "photoSelector" : ".post-body img",    "lastScrapedDate" : "2012-09-01T19:20:59Z"  }  )


