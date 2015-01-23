var express = require("express");
var app = express();
var http = require('http').Server(app);
var mqtt = require("mqtt");
var assert = require("assert");

var mongoClient = require("mongodb").MongoClient;

//var names = { "30:A8:DB:87:D5:1E": "Alfred's Phone" };

var mqttUrl = "mqtt://winter.ceit.uq.edu.au";
var mongoUrl = "mongodb://localhost:27017/wifipresence";

/*************** Mongo ******************/
mongoClient.connect(mongoUrl, function(err, db) {
	assert.equal(err, null);
	console.log("Connected to mongoDB");
	
	var table = db.collection("wifipresencedb");
	var nameTable = db.collection("wifipresencedb_names");
	
	table.find({}, function(err, cur) {
		console.log();
		console.log("Current data in database:");
		console.log();
		cur.each(function (err, data) {
			if (data !== null)
				console.log(data);
		});
	});
	
	var mqtt_client = mqtt.connect(mqttUrl);
	mqtt_client.subscribe("wifipresencedb");
	
	mqtt_client.on("message", function (topic, message) {
		console.log("Got new mqtt update");
		maclist = message.split('\n')
		var currentTime = (new Date).getTime();
		
		for (var i = 0; i < maclist.length; i++) {
			var trimmed = maclist[i].trim();
			console.log("MAC address: " + trimmed);
			console.log("Storing in database...");
			table.update({"mac": trimmed}, {$set:{ time:currentTime }}, { upsert: true, w: 1}, function (err, result) {
				//console.log(err);
				//console.log(result);
			});
						
			nameTable.findOne({"mac": trimmed}, function(err, item) {
				if (item) {
					nameTable.update({"mac": trimmed}, {$set:{ time:currentTime }}, function (err, result) {
					});
					//Make a clone of the database object, but stripping out all the prototype vars, database id, etc
					var jsonobj = { mac: trimmed, time: currentTime, name: item.name };
					//delete result._id
					console.log("Name detected: " + item.name + " pushed to wifipresencenamed");
					mqtt_client.publish("wifipresencenamed", JSON.stringify(jsonobj));
				}
			});
		}
	});
});