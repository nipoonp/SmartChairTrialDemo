/**
 * Created by nipoonnarendra.TRN on 1/2/2017.
 */
var http = require("http");
var fs = require("fs");

var express = require('express');
var app = express();
app.use(express.static('public'));

var configJSON;
var logger;

var emailID;

/**
 * @api {get} /register GET the html file to display on the webpage which the subscriber can register on.
 * @apiName register
 *
 * @apiParam None.
 *
 * @apiSuccess {file} Returns the html file.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *       "register.html"
 *     {
 *     }
 */
app.get('/register', function (request,response) {
    logger.info("/register GET was called");
    response.sendFile(__dirname + '/public/register/register.html');
});



/**
 * @api {get} /register/:registerType GET the html file to display on the webpage which the subscriber can register to. It can be facebook, google or email.
 * @apiName register/:registerType
 *
 * @apiParam {string} the type of registerstion html page you want.
 *
 * @apiSuccess {file} Returns the html file.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "registerFacebook.html" or "registerGmail.html" or "registerEmail.html"
 *     }
 */
app.get('/register/:registerType', function (request,response) {
    var data = request.params;
    var type = data.registerType;

    logger.info("/register/registerType GET was called");

    switch(type) {
        case 'facebook':
            response.sendFile(__dirname + '/public/register/registerFacebook.html');
            break;
        case 'google':
            response.sendFile(__dirname + '/public/register/registerGoogle.html');
            break;
        case 'email':
            response.sendFile(__dirname + '/public/register/registerEmail.html');
            break;
    }
});


/**
 * @api {get} /report/:emailID GET a customised report for a particular userID (this is defined by the incoming emailID).
 * @apiName /report/:emailID

 * @apiSuccess The report.html file which can be displayed on the browser.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "report.html"
 *     }
 */
app.get('/report/:emailID',function (request,response) {

    logger.info("/report GET was called");

    var data = request.params;
    emailID = data.emailID;
    logger.info(data + " " + emailID);

    response.sendFile(__dirname + '/report.html');
});



/**
 * @api {get} /getCategory GET the string of the categories which we are interested in creating the report for.
 * @apiName getCategory
 *
 * @apiParam None.
 *
 * @apiSuccess {String} Returns the string of the categories which the user is interested in, looking at the mongoDB user database record. The string is seperated by commas.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "art,laptops,beauty"
 *     }
 */
app.get('/getCategory',function (request,response) {

    var subscription;
    var outputStr = "";
    var MongoClient = require('mongodb').MongoClient;

    // Connect to the db
    MongoClient.connect(configJSON.database.mongodbURL + configJSON.database.databaseName, function (err, db) {

        db.collection("register", function (err, collection) {

            collection.find({
                "userID": emailID
            }).toArray(function(err, items) {
                if(err) throw err;

                subscription = items[0].data.subscriptions;
                console.log(subscription);

                if(subscription.laptops == true){
                    outputStr = outputStr + "laptops" + ",";
                }
                if(subscription.antiques == true){
                    outputStr = outputStr + "antiques" + ",";
                }
                if(subscription.residential == true){
                    outputStr = outputStr + "residential" + ",";
                }
                if(subscription.mobile == true){
                    outputStr = outputStr + "mobile" + ",";
                }
                if(subscription.art == true){
                    outputStr = outputStr + "art" + ",";
                }
                if(subscription.books == true){
                    outputStr = outputStr + "books" + ",";
                }
                if(subscription.house == true){
                    outputStr = outputStr + "house" + ",";
                }
                if(subscription.car == true){
                    outputStr = outputStr + "car" + ",";
                }
                if(subscription.beauty == true){
                    outputStr = outputStr + "beauty" + ",";
                }

                outputStr = outputStr.slice(0, -1);

                logger.info(outputStr);
                response.send(outputStr);

            });
        });
    });



});


/**
 * @api {post} /transactions POST Info about different transactions
 * @apiName transactions
 *
 * @apiParam {String} Follow the JSON format given in the other documentation.
 *
 * @apiSuccess {String} Transaction Recorded!.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
app.post('/transactions', function (request,response) {

    logger.info("/transactions POST was called");

    var jsonString = '';

    request.on('data', function (data) {
        jsonString += data;
    });

    request.on('end', function () {

        var jsonObj = JSON.parse(jsonString);

        //lets require/import the mongodb native drivers.
        var mongodb = require('mongodb');

        //We need to work with "MongoClient" interface in order to connect to a mongodb server.
        var MongoClient = mongodb.MongoClient;

        // Connection URL. This is where your mongodb server is running.
        var url = configJSON.database.mongodbURL + configJSON.database.databaseName;

        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            if (err) {
                logger.error('Unable to connect to the mongoDB server. Error:', err);
            } else {
                //HURRAY!! We are connected. :)
                logger.info('Connection established to', url);

                // Get the documents collection
                var collection = db.collection(jsonObj['eventType']);

                // Insert some users
                collection.insert([JSON.parse(jsonString)], function (err, result) {
                    if (err) {
                        logger.error(err);
                    } else {
                        logger.info('Inserted new transaction!');
                    }
                    //Close connection
                    db.close();
                });
            }
        });



    });

    logger.info("POST transactions was called...");
    response.send("Transaction recorded!");
})



app.listen(8099, function () {


    var path = require('path');
    var configPath = './public/config/config.json';
    var correctedPath = path.normalize(configPath);
    configJSON = require(__dirname + path.sep + correctedPath);


    var mkdirp = require('mkdirp');
    mkdirp(__dirname + path.sep + 'logs', function (err) {
        if (err) console.error(err)
        else console.log('pow!')
    });

    var log4js = require('log4js');
    log4js.loadAppender(configJSON.log4js.loadAppenderType);
    log4js.addAppender(log4js.appenders.file(configJSON.log4js.path), configJSON.log4js.loggerName);
    logger = log4js.getLogger(configJSON.log4js.loggerName);
    logger.setLevel(configJSON.log4js.level);


    logger.info('Server running...');
    logger.info(configJSON);
});