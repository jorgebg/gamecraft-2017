#!/bin/sh
rm -rf embed embed.zip
cp -r public embed
mkdir -p embed/node_modules/socket.io-client/dist/; cp node_modules/socket.io-client/dist/socket.io.js embed/node_modules/socket.io-client/dist/
mkdir -p embed/node_modules/jquery/dist/; cp node_modules/jquery/dist/jquery.js embed/node_modules/jquery/dist/
mkdir -p embed/node_modules/phaser/build/; cp node_modules/phaser/build/phaser.js embed/node_modules/phaser/build/
mkdir -p embed/node_modules/nipplejs/dist/; cp node_modules/nipplejs/dist/nipplejs.js embed/node_modules/nipplejs/dist/
sed -i '' 's/io()/io("https:\/\/humstar2017.herokuapp.com")/' embed/index.html
zip -r embed.zip embed -x *.DS_Store
rm -rf embed
