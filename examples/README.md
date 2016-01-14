# Examples for Using the Library

This folder includes sample code snippets which display a number of the library's capabilities. These include retrieving the info of a logged in user, subscribing to a device data channel and a small app which causes the LED of the sound level sensor to turn on as a result of the sensor measuring a noise level exceeding 100.

## getUser.js

This example allows you, based on an entered token (can be retrieved from your [API Keys Page](https://developer.relayr.io/dashboard/apps/myApps)), to retrieve the user associated with the token, their associated devices. 
The sample also iterates through all devices until it finds a device which model is a Humidity/Temperature and establishes a data channel to start receiving data from it.
The app writes the data received to the console log.

## simpleOutput.js

This example lists information about the three modules **humidity/temperature, light/proximity/color** and **sound** it then establishes a respective data channel for each of them and outputs the data received.

## soundBlink.js

This example app establishes a data channel to the sound level sensor, connects to it and checks the sound level. Whenever the sound level exceeds 100 it sends a command to turn the sound sensor LED on for one second and then turns it off.    