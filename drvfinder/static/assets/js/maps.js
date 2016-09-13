"use strict";
var $ = jQuery.noConflict();

var mapStyles = [ {"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":20}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"saturation":-100},{"visibility":"on"},{"lightness":10}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":50}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#f49935"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#fad959"}]}, {featureType:'road.highway',elementType:'all',stylers:[{hue:'#dddbd7'},{saturation:-92},{lightness:60},{visibility:'on'}]}, {featureType:'landscape.natural',elementType:'all',stylers:[{hue:'#c8c6c3'},{saturation:-71},{lightness:-18},{visibility:'on'}]},  {featureType:'poi',elementType:'all',stylers:[{hue:'#d9d5cd'},{saturation:-70},{lightness:20},{visibility:'on'}]} ];

// Set map height to 100% ----------------------------------------------------------------------------------------------

var $body = $('body');
if( $body.hasClass('map-fullscreen') ) {
    if( $(window).width() > 768 ) {
        $('.map-canvas').height( $(window).height() - $('.header').height() );
    }
    else {
        $('.map-canvas #map').height( $(window).height() - $('.header').height() );
    }
}

var _latitude = 25.199514;
var _longitude = 55.277397;
var _firstTimeLoaded=true;
var _zoom = 10;
var map;


function setMap(){

  var mapCenter = new google.maps.LatLng(_latitude,_longitude);
  var mapOptions = {
      zoom: _zoom,
      center: mapCenter,
      disableDefaultUI: false,
      scrollwheel: false,
      styles: mapStyles,
      mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.BOTTOM_CENTER
      },
      panControl: false,
      zoomControl: true,
      zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE,
          position: google.maps.ControlPosition.LEFT_BOTTOM
      }
  };

  var mapElement = document.getElementById('map');
  return new google.maps.Map(mapElement, mapOptions);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Homepage map - Google
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createHomepageGoogleMap(json){


     map=setMap();

     var newMarkers = [];
     var markerClicked = 0;
     var activeMarker = false;
     var lastClicked = false;

     for (var i = 0; i < json.data.length; i++) {

            // Google map marker content -----------------------------------------------------------------------------------
            if( json.data[i].color ) var color = json.data[i].color;
            else color = '';

            var markerContent = document.createElement('DIV');
            markerContent.innerHTML =
                    '<div class="map-marker ' + color + '">' +
                        '<div class="icon">' +
                        '<img src="'+json.data[i].picture+'">' +
                        '</div>' +
                    '</div>';
            // Create marker on the map ------------------------------------------------------------------------------------
            var marker = new RichMarker({
                position: new google.maps.LatLng( json.data[i].latitude, json.data[i].longitude ),
                map: map,
                draggable: false,
                content: markerContent,
                flat: true
            });
            newMarkers.push(marker);

            // Create infobox for marker -----------------------------------------------------------------------------------
            var infoboxContent = document.createElement("div");
            var infoboxOptions = {
                content: infoboxContent,
                disableAutoPan: false,
                pixelOffset: new google.maps.Size(-18, -42),
                zIndex: null,
                alignBottom: true,
                boxClass: "infobox",
                enableEventPropagation: true,
                closeBoxMargin: "0px 0px -30px 0px",
                closeBoxURL: "/static/assets/img/close.png",
                infoBoxClearance: new google.maps.Size(1, 1)
            };

            // Infobox HTML element ----------------------------------------------------------------------------------------
            var category = json.data[i].category;
            infoboxContent.innerHTML = drawInfobox(category, infoboxContent, json, i);
            // Create new markers ------------------------------------------------------------------------------------------
            newMarkers[i].infobox = new InfoBox(infoboxOptions);
            // Show infobox after click ------------------------------------------------------------------------------------

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    google.maps.event.addListener(map, 'click', function(event) {
                        lastClicked = newMarkers[i];
                    });
                    activeMarker = newMarkers[i];
                    if( activeMarker != lastClicked ){
                        for (var h = 0; h < newMarkers.length; h++) {
                            newMarkers[h].content.className = 'marker-loaded';
                            newMarkers[h].infobox.close();
                        }
                        newMarkers[i].infobox.open(map, this);
                        newMarkers[i].infobox.setOptions({ boxClass:'fade-in-marker'});
                        newMarkers[i].content.className = 'marker-active marker-loaded';
                        markerClicked = 1;
                    }
                }
            })(marker, i));

            // Fade infobox after close is clicked -------------------------------------------------------------------------

            google.maps.event.addListener(newMarkers[i].infobox, 'closeclick', (function(marker, i) {
                return function() {
                    activeMarker = 0;
                    newMarkers[i].content.className = 'marker-loaded';
                    newMarkers[i].infobox.setOptions({ boxClass:'fade-out-marker' });
                }
            })(marker, i));
        }

        // Close infobox after click on map --------------------------------------------------------------------------------

        google.maps.event.addListener(map, 'click', function(event) {
            if( activeMarker != false && lastClicked != false ){
                if( markerClicked == 1 ){
                    activeMarker.infobox.open(map);
                    activeMarker.infobox.setOptions({ boxClass:'fade-in-marker'});
                    activeMarker.content.className = 'marker-active marker-loaded';
                }
                else {
                    markerClicked = 0;
                    activeMarker.infobox.setOptions({ boxClass:'fade-out-marker' });
                    activeMarker.content.className = 'marker-loaded';
                    setTimeout(function() {
                        activeMarker.infobox.close();
                    }, 350);
                }
                markerClicked = 0;
            }
            if( activeMarker != false ){
                google.maps.event.addListener(activeMarker, 'click', function(event) {
                    markerClicked = 1;
                });
            }
            markerClicked = 0;
        });


        addEvents(newMarkers, json);

        redrawMap('google', map);

}


function addEvents(newMarkers, json){

              $('#msearch').keyup(function() {
                delay(function(){
                  dynamicLoadMarkers(map, newMarkers, json);
                }, 1000 );
              });

              google.maps.event.addListener(map, 'idle', function() {
                dynamicLoadMarkers(map, newMarkers, json);
              });


              $('#distance').on('change', function () {
                    _firstTimeLoaded=true;
                    dynamicLoadMarkers(map, newMarkers, json);
              });

              $('#daysx').on('change', function () {
                  dynamicLoadMarkers(map, newMarkers, json);
              });

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Center map to marker position if function is called (disabled) ------------------------------------------------------

function centerMapToMarker(){
    $.each(json.data, function(a) {
        if( json.data[a].id == id ) {
            var _latitude = json.data[a].latitude;
            var _longitude = json.data[a].longitude;
            var mapCenter = new google.maps.LatLng(_latitude,_longitude);
            map.setCenter(mapCenter);
        }
    });
}

function checkName(name){

  var text=$("#distance :selected").text();

  if(text=="All")
      return true;

  if(name==text)
     return true;

  return false;
}

function dynamicLoadMarkers(map, loadedMarkers, json){

              var visibleArray = [];
              var visibleItemsArray = [];
              var visibleItemsArrayX = [];
              var category;


              for (var i = 0; i < json.data.length; i++) {
                  if ( checkName(json.data[i].title) )
                  {
                      category = json.data[i].category;
                      visibleArray.push(loadedMarkers[i]);
                      $.each( visibleArray, function (i) {
                          setTimeout(function(){
                              if ( map.getBounds().contains(visibleArray[i].getPosition()) ){
                                  if( !visibleArray[i].content.className ){
                                      visibleArray[i].setMap(map);
                                      visibleArray[i].content.className += 'bounce-animation marker-loaded';
                                  }
                              }
                          }, i * 50);
                      });
                  } else {
                      loadedMarkers[i].content.className = '';
                      loadedMarkers[i].setMap(null);
                  }
              }


              if(_firstTimeLoaded){
                _firstTimeLoaded=false;
              var bounds = new google.maps.LatLngBounds();
              for (var i = 0; i < visibleArray.length; i++) {
               bounds.extend(visibleArray[i].getPosition());
              }
              map.fitBounds(bounds);
            }

    }

// Redraw map after item list is closed --------------------------------------------------------------------------------

function redrawMap(mapProvider, map){

        $('.map-canvas').toggleClass('results-collapsed');

}




////////////////////////////////////////////////////////////


/////////////
function drawInfobox(category, infoboxContent, json, i){

    if(json.data[i].color)          { var color = json.data[i].color }
        else                        { color = '' }
    if( json.data[i].date )        { var price = '<div class="price">' + json.data[i].date +  '</div>' }
        else                        { price = '' }
    if(json.data[i].id)             { var id = json.data[i].id }
        else                        { id = '' }
    if(json.data[i].picture)            { var url = json.data[i].picture }
        else                        { url = '' }
    if(json.data[i].time)           { var type = json.data[i].time }
        else                        { type = '' }
    if(json.data[i].title)          { var title = json.data[i].title }
        else                        { title = '' }
    if(json.data[i].location)       { var location = json.data[i].location }
        else                        { location = '' }
    if(json.data[i].picture)     { var gallery = json.data[i].picture }
        else                        { gallery[0] = '../img/default-item.jpg' }

    var ibContent = '';
    ibContent =
    '<div class="infobox ' + color + '">' +
        '<div class="inner">' +
            '<div class="image">' +
                '<div class="item-specific">' + drawItemSpecific(category, json, i) + '</div>' +

                '<a href=# class="description">' +
                    '<div class="meta">' +
                        price +
                        '<h2>' + title +  '</h2>' +
                        '<figure>' + location +  '</figure>' +
                        '<i class="fa fa-angle-right"></i>' +
                    '</div>' +
                '</a>' +
                '<img src="' + gallery +  '">' +
            '</div>' +
        '</div>' +
    '</div>';

    return ibContent;
}
var add;

function drawItemSpecific(category, json, i){

   add=GetAddress(json.data[i].latitude,json.data[i].longitude)

    var itemSpecific = '';
            return itemSpecific;

}

function GetAddress(lat, lng) {
            var latlng = new google.maps.LatLng(lat, lng);
            var geocoder = geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {

                      add=results[1].formatted_address;
                    }
                }
            });
        }
