// globals
var mapInitiationCenterCoordinates;
var aliasInput, channelInput;
var chatInputForm;
var messageLog;

window.onload = function(e){ 
  console.log("window.onload", e, Date.now() ,window.tdiff);
  retrieveCoordinatesFromIP();
  chatInputForm = document.getElementById("chatInputForm");
  aliasInput = document.getElementById("aliasInput");
  channelInput = document.getElementById("channelInput");
  messageLog = document.getElementById("messageLog");
  initiateChat();
}

// function for CORS request on IP address as XML
function loadDoc(url, cFunction) {
  var xhttp;
  xhttp=new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      XHTTPResultHelper(this);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

// CORS response handler
function XHTTPResultHelper(xhttp) {
  var locationSearchResult = JSON.parse(xhttp.responseText)["loc"];
  if(locationSearchResult != null){
    //handle result
    console.log(locationSearchResult);
    var resultLat = String(locationSearchResult).split(',')[0];
    var resultLng = String(locationSearchResult).split(',')[1];
    mapInitiationCenterCoordinates = {lat: Number(resultLat), lng: Number(resultLng)};
    initMapOnDocLoad();
    sendCoordinatesFromIP();
    console.log(resultLng + " " + resultLat);

    var marker = new google.maps.Marker({
      position: mapInitiationCenterCoordinates,
      title:"IP location"
    });
    
    // To add the marker to the map, call setMap();
    marker.setMap(map);
  } else {
    console.log("No matches found for location element");
  }
  console.log(xhttp.responseText); 
}

// initiate Google Maps
var map;
function initMap() {
  console.log("overriding default constructor");
}
function initMapOnDocLoad(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: mapInitiationCenterCoordinates,
    zoom: 13
  });
}

function retrieveCoordinatesFromIP(){
  loadDoc('https://ipinfo.io/json', XHTTPResultHelper); 
}

// toggle map broadcast
function gpsToggleHandler() {
  console.log("toggle gps function begin");
}