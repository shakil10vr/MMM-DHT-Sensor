"use strict";

/* Magic Mirror
 * Module: MMM-DHT-Sensor
 *
 * By Tanveer Rahman
 */

const NodeHelper = require("node_helper");
var async = require('async');
var sys = require('util');
var exec = require('child_process').exec;

//const sensor = require("node-dht-sensor");

module.exports = NodeHelper.create({

	start: function() {
		console.log("MMM-DHT-Sensor helper started ...");
	},
	/**
	 * readSensor()
	 * Requests sensor data.
	 */
	/*
	readSensor: function(sensorPin, sensorType) {
		var self = this;
		sensor.read(sensorType, sensorPin, function(err, temperature, humidity) {
		  if (!err) {
				self.sendSocketNotification("SENSOR_DATA", {"temperature": temperature.toFixed(1), "humidity": humidity.toFixed(1) });
			} else {
				self.sendSocketNotification("SENSOR_DATA", {"temperature": null, "humidity": null });
				console.log(err);
			}
		});
	},
	*/
	readSensor: function(sensorPin, sensorType) {
		var self = this;
		try{
		async.parallel([
		async.apply(exec, 'sudo /home/pi/Adafruit_Python_DHT/examples/./AdafruitDHT.py ' + sensorType +' '+ sensorPin +' t'),
		async.apply(exec, 'sudo /home/pi/Adafruit_Python_DHT/examples/./AdafruitDHT.py ' + sensorType +' '+ sensorPin +' h')
		],
		function (err, res) {
			var stats = {};
			stats.temperature = res[0][0];
			stats.humidity = res[1][0];
			if (!err) {
				self.sendSocketNotification("SENSOR_DATA", {"temperature": stats.temperature, "humidity": stats.humidity });
			} else {
				self.sendSocketNotification("SENSOR_DATA", {"temperature": null, "humidity": null });
				console.log(err);
			}
		});
		}
		catch (err){
			self.sendSocketNotification("SENSOR_DATA", {"temperature": null, "humidity": null });
			console.log(err);
		}
		
	},

	//Subclass socketNotificationReceived received.
	socketNotificationReceived: function(notification, payload) {
		var self = this;
		
		if (notification === "GET_SENSOR_DATA") {
			this.readSensor(payload.sensorPin, payload.sensorType);
		}
	},
});
