Installation

1. git clone https://github.com/whittlem/B9lab-ETH-17-Projects

2. cd B9lab-ETH-17-Projects

3. git submodule update --init --force --remote

4. cd Module_4-Splitter; npm install; cd ..

5. cp -r Module_4-Splitter/node_modules Module_4-RockPaperScissors

6. cp -r Module_4-Splitter/node_modules Module_4-Remittance

7. cp -r Module_4-Splitter/node_modules Module_7-CampaignHub


Updating

1. git pull

2. git submodule update --init --force --remote


TestRPC

1. <Project_Directory>/node_modules/.bin/testrpc   e.g. Module_4-Splitter/node_modules/.bin/testrpc


Unit Tests

1. Make sure TestRPC is running

2. cd <Project_Directory>  e.g. cd Module_4-Splitter

2. rm build/contracts/*.json; ./node_modules/.bin/truffle compile --all; ./node_modules/.bin/truffle test


Truffle Default Builder

1. Make sure TestRPC is running

2. cd <Project_Directory>  e.g. cd Module_7-CampaignHub-TruffleDefaultBuilder

3. rm build/contracts/*.json; ./node_modules/.bin/truffle compile --all; ./node_modules/.bin/truffle migrate --reset; ./node_modules/.bin/truffle build

4. php -S 0.0.0.0:8000 -t <Project_Directory>/build/app   e.g. php -S 0.0.0.0:8000 -t build

5. Open http://127.0.0.1:8000 in your browser


Webpack

1. Make sure TestRPC is running

2. cd <Project_Directory>  e.g. cd Module_7-CampaignHub-Webpack

3. rm build/contracts/*.json; ./node_modules/.bin/truffle compile --all; ./node_modules/.bin/truffle migrate --reset; ./node_modules/.bin/truffle build

4. php -S 0.0.0.0:8000 -t <Project_Directory>/build/app   e.g. php -S 0.0.0.0:8000 -t build/app

5. Open http://127.0.0.1:8000 in your browser


React

1. Install truffle globally -- sudo npm install truffle -g

2. Create a react project directory

3. Enter the directory and type "truffle unbox react"

4. Update the truffle.js with the network details

5. Run "truffle compile", "truffle migrate --reset", "npm start"
