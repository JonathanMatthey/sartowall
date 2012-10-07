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
NODE_ENV:      production
PATH:          bin:node_modules/.bin:/usr/local/bin:/usr/bin:/bin
SCHEDULER_URL: http://8dsf5gk50slrz46oy9ms02040@heroku-scheduler.herokuapp.com/