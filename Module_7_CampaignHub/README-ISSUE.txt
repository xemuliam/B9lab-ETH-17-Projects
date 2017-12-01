$ rm build/contracts/*.json; ./node_modules/.bin/truffle compile; ./node_modules/.bin/truffle build; ./node_modules/.bin/webpack
Compiling ./contracts/Campaign.sol...
Compiling ./contracts/Hub.sol...
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Owned.sol...
Compiling ./contracts/Stoppable.sol...
Writing artifacts to ./build/contracts

Running `./node_modules/.bin/webpack`...
Hash: e2bf0d96ae4eb183c4b7
Version: webpack 3.8.1
Time: 44ms
     Asset     Size  Chunks             Chunk Names
index.html  2.64 kB       0  [emitted]  main
   [0] ./app/index.html 164 bytes {0} [built] [failed] [1 error]

ERROR in ./app/index.html
Module parse failed: Unexpected token (1:0)
You may need an appropriate loader to handle this file type.
| <!DOCTYPE html>
| <html>
| <head>

Error building:

Command exited with code 2

Build failed. See above.
Hash: e2bf0d96ae4eb183c4b7
Version: webpack 3.8.1
Time: 42ms
     Asset     Size  Chunks             Chunk Names
index.html  2.64 kB       0  [emitted]  main
   [0] ./app/index.html 164 bytes {0} [built] [failed] [1 error]

ERROR in ./app/index.html
Module parse failed: Unexpected token (1:0)
You may need an appropriate loader to handle this file type.
| <!DOCTYPE html>
| <html>
| <head>