$ rm build/contracts/*.json; ./node_modules/.bin/truffle compile; ./node_modules/.bin/truffle build; ./node_modules/.bin/webpack
Compiling ./contracts/Campaign.sol...
Compiling ./contracts/Hub.sol...
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Owned.sol...
Compiling ./contracts/Stoppable.sol...
Writing artifacts to ./build/contracts

Running `./node_modules/.bin/webpack`...
Hash: 616cca24f28677364049
Version: webpack 3.8.1
Time: 93ms
        Asset     Size  Chunks             Chunk Names
../index.html  6.16 kB          [emitted]  
   index.html  11.5 kB       0  [emitted]  main
   [0] ./app/js/app.js 8.92 kB {0} [built]
   [1] ./node_modules/file-loader/dist/cjs.js?name=../index.html!./app/index.html 59 bytes {0} [built]

Hash: 616cca24f28677364049
Version: webpack 3.8.1
Time: 94ms
        Asset     Size  Chunks             Chunk Names
../index.html  6.16 kB          [emitted]  
   index.html  11.5 kB       0  [emitted]  main
   [0] ./app/js/app.js 8.92 kB {0} [built]
   [1] ./node_modules/file-loader/dist/cjs.js?name=../index.html!./app/index.html 59 bytes {0} [built]


$ php -S 0.0.0.0:8000 -t ./build
PHP 7.1.7 Development Server started at Fri Dec  1 17:33:27 2017
Listening on http://0.0.0.0:8000
Document root is /Module_7_CampaignHub/build
Press Ctrl-C to quit.
