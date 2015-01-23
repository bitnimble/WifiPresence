var mongoClient = require("mongodb").MongoClient;
var mongoUrl = "mongodb://localhost:27017/wifipresence";

function split(str, delim, count){
	var parts = str.split(delim);
	var tail = parts.slice(count).join(delim);
	var result = parts.slice(0,count);
	result.push(tail);
	return result;
}

mongoClient.connect(mongoUrl, function(err, db) {
	var nameTable = db.collection("wifipresencedb_names");
	
	var stdin = process.openStdin();
	stdin.on('data', function(line) { 
		console.log();
		var parts = split(line.toString(), " ", 2);
		parts[1] = parts[1].trim();
	
		if (parts[0] == "a") {		
			parts[2] = parts[2].trim();	
			nameTable.update({"mac": parts[1]}, {$set:{"name": parts[2]}}, { upsert: true, w: 1}, function(err, result) {
				if (err === null) {
					console.log("Address registered successfully with no errors.");
				}
				else {
					console.log(err);
					console.log("Status: " + result);
				}
			});
			console.log();
		} else if (parts[0] == "r") {
			nameTable.remove({"mac": parts[1]}, function(err, result) {
				if (err === null) {
					console.log("Address unregistered successfully with no errors.");
				}
				else {
					console.log(err);
					console.log("Status: " + result);
				}
			});
		}
	});
});


