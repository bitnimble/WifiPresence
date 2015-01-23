var express = require("express");
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.json());

var http = require('http').Server(app);
var io = require("socket.io")(http);

var mqtt = require("mqtt");
var fs = require("fs");
var moment = require("moment");

var mongoClient = require("mongodb").MongoClient;
var mongoUrl = "mongodb://localhost:27017/wifipresence";


function broadcastObject(obj, sockObj) {
	console.log("Broadcasting update");
	obj.nicetime = moment(obj.time, "x").format("ddd D MMM, h:mm A");
	delete obj._id;
	sockObj.emit("update", obj);
}

function broadcastArray(arr, sockObj) {
	console.log("Broadcasting multiupdate");
	for (var i = 0; i < arr.length; i++) {
		broadcastObject(arr[i], sockObj);
	}
}

function broadcastRecentArray(sockObj) {
	//Ask the database server for the last 2 days of addresses/times/names
	console.log("Getting recents from db...");
	mongoClient.connect(mongoUrl, function(err, db) {
		var currentTime = new Date().getTime();
		var nameTable = db.collection("wifipresencedb_names");
		var cursor = nameTable.find({ "time": {$gte: currentTime - (2 * 24 * 60 * 60 * 1000)}});
		cursor.toArray(function(err, docs) {
			console.log("Completed db read.");
			console.log(docs);
			console.log("------");
			broadcastArray(docs, sockObj);
		});
	});
}

/*************** MQTT *******************/
mqtt_client = mqtt.connect("mqtt://winter.ceit.uq.edu.au");
mqtt_client.subscribe("wifipresencenamed");
mqtt_client.on("message", function (topic, message) {
	console.log("Got new mqtt update");	
	broadcastObject(JSON.parse(message), io);
});


/*************** IO ********************/
io.on("connection", function (socket) {
	console.log("New client watching for updates!");
	broadcastRecentArray(socket);
	socket.on("disconnect", function () {
		console.log("Client disconnected");
	});
});


/*************** Express **************/
app.get("/", function (req, res) {
    res.send(fs.readFileSync("html/index.html", "utf8"));
});

app.use("/css", express.static("html/css"));
app.use("/fonts", express.static("html/fonts"));

http.listen(42941, function () {
	console.log("Server listening on port 42941");
});
