/* Magic Mirror
 * Module: MMM-DHT-Sensor
 *
 * By Ricardo Gonzalez http://www.github.com/ryck/MMM-DHT-Sensor
 * MIT Licensed.
 * 
 * Edited by Tanveer Rahman
 */

Module.register("MMM-DHT-Sensor", {

  defaults: {
    updateInterval: 60 * 60 * 1000, // Every hour.
    initialLoadDelay: 0, // No delay/
    animationSpeed: 1000, // One second.
    units: config.units, // Celsius
    relativeScale: 30,
    debug: false,
    sensorPin: 2,
    sensorType: 22
  },

  start: function() {
    this.temperature = null;
    this.humidity = null;
    this.loaded = false;
    this.updateTimer = null;
    Log.info('Starting module: ' + this.name);
    this.scheduleUpdate(this.config.initialLoadDelay);
    this.updateSensorData(this);
  },

  getStyles: function() {
    return ["MMM-DHT-Sensor.css", "font-awesome.css", "weather-icons.css"];
  },

  //Define header for module.
  getHeader: function() {
    return this.data.header;
  },

  // updateSensorData
  updateSensorData: function(self) {
    if(this.config.debug) {
      Log.info("sendSocketNotification: GET_SENSOR_DATA");
    }
    self.sendSocketNotification("GET_SENSOR_DATA", {"sensorPin": this.config.sensorPin, "sensorType": this.config.sensorType});
  },

  /* scheduleUpdate()
   * Schedule next update.
   * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
   */
  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(function() {
      self.updateSensorData(self);
    }, nextLoad);
  },

  processSensorData: function(data) {
	var self = this;
    if (typeof data !== "undefined" && data !== null) {
      if(this.config.debug) {
        Log.info(data);
      }
      this.loaded = true;
      // Convert C to F
	  var RH = data.humidity;
	  var Temp = data.temperature;
	  var T = Temp * 9/5 + 32;
      if (this.config.units === 'imperial') {
        this.temperature = T;
      } else {
        this.temperature = Temp;
      }
      if (typeof this.temperature !== "undefined" && this.temperature !== null)  {
        this.sendNotification("INDOOR_TEMPERATURE", this.temperature);
      }
	  var c1 = -42.379;
	  var c2 = 2.04901523;
      var c3 = 10.14333127;
      var c4 = -0.22475541;
      var c5 = -6.83783e-3;
      var c6 = -5.481717e-2;
      var c7 = 1.22874e-3;
      var c8 = 8.5282e-4;
      var c9 = -1.99e-6;
	  // try simplified formula first (used for HI < 80)
	  var HI = 0.5 * (T + 61. + (T - 68.) * 1.2 + RH * 0.094);
	  if (HI >= 80){
		  HI = c1 + c2 * T + c3 * RH + c4 * T * RH 
				+ c5 * T * T + c6 * RH * RH + c7 * T * T * RH 
				+ c8 * T * RH * RH + c9 * T * T * RH * RH;
	  }
      this.humidity = Math.round((HI - 32) * 5/9);
      if (typeof this.humidity !== "undefined" && this.humidity !== null)  {
        this.sendNotification("INDOOR_HUMIDITY", this.humidity);
      }      
      this.updateDom(this.config.animationSpeed);
    }
  },

  // Override dom generator.
  getDom: function() {
	var self = this;
    var wrapper = document.createElement("div");

    if (this.config.sensorPin === "") {
      wrapper.innerHTML = "Please set the GPIO pin number.";
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    if (this.config.sensorType === "") {
      wrapper.innerHTML = "Please set the sensor type (11 / 22).";
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    if (!this.loaded) {
      wrapper.innerHTML = "Loading sensor data...";
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    // Start building table.
    var dataTable = document.createElement("table");
    dataTable.className = "large";

    var tempRow = document.createElement("tr");;
    var humidRow = document.createElement("tr");;

    if (this.temperature != null && this.humidity != null) {
      var temperatureCell = document.createElement("td");
      temperatureCell.className = "data temperature";

      // Get a 40C ratio value to set the thermometer icon scale.
      // var temperatureRatio = this.temperature / this.config.relativeScale;

      var degreeLabel = "";
      switch (this.config.units ) {
        case "metric":
          degreeLabel = "°";
          break;
        case "imperial":
          degreeLabel = "F";
          break;
        case "default":
          degreeLabel = "°";
          break;
      }
      /*
      // Asign themomether icon.
      switch (true) {
        case temperatureRatio < 0:
          if(this.config.debug) {
            Log.info("thermometer-empty " + this.temperature + " - " + temperatureRatio);
          }
          temperatureCell.className += "thermometer-empty";
          break;
        case temperatureRatio >= 0 && temperatureRatio < 0.25:
          if(this.config.debug) {
            Log.info("thermometer-quarter " + this.temperature + " - " + temperatureRatio);
          }
          temperatureCell.className += "thermometer-quarter";
          break;
        case temperatureRatio >= 0.25 && temperatureRatio < 0.5:
          if(this.config.debug) {
            Log.info("thermometer-half " + this.temperature + " - " + temperatureRatio);
          }
          temperatureCell.className += "thermometer-half";
          break;
        case temperatureRatio >= 0.5 && temperatureRatio < 0.75:
          if(this.config.debug) {
            Log.info("thermometer-three-quarters " + this.temperature + " - " + temperatureRatio);
          }
          temperatureCell.className += "thermometer-three-quarters";
          break;
        case temperatureRatio > 0.75:
          if(this.config.debug) {
            Log.info("thermometer-full " + this.temperature + " - " + temperatureRatio);
          }
          temperatureCell.className += "thermometer-full";
          break;
      } */
	  var temp = document.createElement("div");
		temp.className = "large";
		tempRow.appendChild(temp);
	  var tempIcon = document.createElement("span");
	  tempIcon.className = "wi wi-thermometer";
	  tempRow.appendChild(tempIcon);
	  temperatureCell.className = "bright light";
      temperatureCell.innerHTML = (this.temperature + degreeLabel).replace(/\s/g, '');
      tempRow.appendChild(temperatureCell);
	  
	  var humid = document.createElement("div");
		humidRow.appendChild(humid);
      var humidityCell = document.createElement("td");
      humidityCell.className = "medium dimmed";
      humidityCell.innerHTML = " Feels " + this.humidity + "°";
      humidRow.appendChild(humidityCell);

      dataTable.appendChild(tempRow);
      dataTable.appendChild(humidRow);
    } else {
      var row1 = document.createElement("tr");
      dataTable.appendChild(row1);

      var messageCell = document.createElement("td");
      messageCell.innerHTML = "No data returned";
      messageCell.className = "bright medium";
      row1.appendChild(messageCell);
	  this.start();
    }
    wrapper.appendChild(dataTable);
    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "SENSOR_DATA") {
      this.processSensorData(payload);
      this.scheduleUpdate(this.config.updateInterval);
      if(this.config.debug) {
        Log.info("socketNotificationReceived: SENSOR_DATA");
      }
    }
  }
});
