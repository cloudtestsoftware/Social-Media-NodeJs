# Backend Social Media Aggregator Service

Social media aggregation service that allows users to search through from a variety of sources. You can find the front-end on https://github.com/ccodes/Social-Media-AngularJs. 


## Next Release

### Enhancements / Updates Needed (Updated Nov 14, 2017)
* Add Testing: Mocha and Chai.js
* Change folders structure: instead of grouping files by their type (controllers, routs, etc), folder them up by social networ (e.g. facebook, instagram, twitter, etc), this way we start framing it more modular, in other words, to add a new social channel, would be as easy as adding a new "folder".
* Fix Instragram endpoint: Add "Sandbox Users" on Instagram API Sandbox testing environment, (and manually create posts), this way we could query existing posts from our solution.
* The config file was added plain text because I was taking advantage of AWS S3 Server-Side Encryption, however, in the next release it would be via Env Variables.
* Run JSHint and perform updates needed
* ...

## Setting Up

### Prerequisites
* Make sure you have node and npm installed using `node --version` and  `npm --version`.
If not install it using [Homebrew](http://brew.sh/).
```
brew install node
```

* Install a node version manager to get a previous version of node. For example, [n](https://github.com/tj/n). After, follow the instructions on n's GitHub page to install v0.10.35 of node.

* Go to the directory where you cloned the project and install npm packages.
```
npm install
```
* Start the server.
```
node app.js
```
Tip: use `nodemon` if you are going to edit the files and do not want to restart the server every time. Install nodemon globally: `npm install -g nodemon`. Start the server with nodemon:
```
nodemon app.js
```

## Directory Structure
+ config (all config files go here).
+ controllers (_controllers for all models go here_).
+ log
+ middlewares (_routing middlewares_)
+ models (_Mongoose models defined here_)
+ resources (_public resources_)
+ routes (_define all backend routes here_)
+ test
+ utils (_common util functions_) 

## API endpoints

```
/auth/login
```
+ Post (username, password)
+ Authenticate user and return a token

```
/auth/login
```
+ Method: Post (username, password)
+ Action: Authenticate user and return a token, the token contains the credentials and an expiration date.


```
/facebook/page
```
+ Method: Post
+ Action: Searches the feed of the first 20 posts (including status updates) and links published by this page, or by others on this page.


```
/facebook/next
```
+ Method: Get
+ Action: Searches the feed of the next 20 posts (including status updates) and links published by this page, or by others on this page.



```
/tweets/hashtag
```
+ Method: Post
+ Action: Searches against a sampling of recent Tweets published in the past 7 days. Retrieves the first 25 tweets.


```
/tweets/next
```
+ Method: Get
+ Action: Searches against a sampling of recent Tweets published in the past 7 days. Retrieves the next 25 tweets.



```
/instagram/tag
```
+ Method: Post
+ Action: Get a list of recently tagged media. Limited to 25.


```
/instagram/next
```
+ Method: Get
+ Action: Get a list of recently tagged media. Next 25.
