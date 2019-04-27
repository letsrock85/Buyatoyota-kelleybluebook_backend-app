## Comparison App ##
The app has been created to compare two vehicles where one of them (the boss) must be the winner. It marks each comparison by one of these: kbb; video; false


![Image description](https://mir-s3-cdn-cf.behance.net/project_modules/1400/dc375652805295.591d231b94225.jpg)
![Image description](https://mir-s3-cdn-cf.behance.net/project_modules/disp/0716bb52805295.591d231b93e2e.png)
![Image description](https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/72f5d052805295.591d2a3404fe3.png)


### Incoming Data ###

#### lookupTable.xlsx ####
This file contains a list of ids that can be used to fetch data about a certain vehicle from Kelly Blue Book API. Each run the app converts this file into a JSON version.
File Location: ./assets/se/kbb_automation_app/input/lookupTable.xlsx   

#### conquestTargetAudience.csv ####
There are 3 versions of this file: CN; WW; NE. Those files contain a list of keywords that use the following format "?series=toyota_camry&competitor=honda_civic" to define a pair of vehicle to compare. The file is generated and being maintained by the client.
File Location: ./assets/<region_name>/html5/conquestTargetAudience.csv

#### Kelly Blue Book API ####
RESTful API which is used by the app to get rates of a certain pair of vehicles

#### Fuel API ####
RESTful API which is used to to retrieve URL to images of vehicles if they cannot be found at TCAA ftp

### To run locally ###
1. Install nodejs and npm   
2. Locate the project folder in your terminal   
3. Type "node index --region <regon_name>"

### Outcoming data ###

#### conquestTargetAudience.csv ####
After retrieving up to date data from APIs the app marks the original file in an appropriate way and saves it into the output folder.
File Location: ./assets/se/kbb_automation_app/output/<region_name>/conquestTargetAudience.csv

#### lookupTable.json ####
The result of conversion of a lookupTable.xlsx file. In use by the landing page app.
File Location: ./assets/se/kbb_automation_app/output/lookupTable.json

#### data

### Parameters ###
1. Set a region name (required)    
--region <string>     
2. Crop the list of pairs to compare (for debug)    
--max <number>    
3. Crop form the end    
-r    
4. Log into a file    
-l     
5. Run in debug mode
-d

### Usage ###
The app can be called via cron jobs on Blue Host with the following command    
./home1/wolaverd/.nvm/versions/node/v7.3.0/bin/node /home1/wolaverd/public_html/kbb-automation-app/index.js --region <region_name>    

### CRON jobs on Blue Host ###
0	2	*	*	*	/home1/wolaverd/.nvm/versions/node/v7.3.0/bin/node/home1/wolaverd/public_html/kbb-automation-app/index.js --region ne -l
20	2	*	*	*	/home1/wolaverd/.nvm/versions/node/v7.3.0/bin/node/home1/wolaverd/public_html/kbb-automation-app/index.js --region cn -l
40	2	*	*	*	/home1/wolaverd/.nvm/versions/node/v7.3.0/bin/node/home1/wolaverd/public_html/kbb-automation-app/index.js --region ww -l

### The app location at WD ftp ###
./kbb-automation-app   

### The assets which are at TCAA ftp ###
./assets/se/kbb_automation_app   

### Debug info pages ###
http://wolaverdesigns.com/kbb-automation-app/public/output/ne/
http://wolaverdesigns.com/kbb-automation-app/public/output/cn/
http://wolaverdesigns.com/kbb-automation-app/public/output/Ww/
