ontainer = document.querySelector('.map-container');
var inputBox = document.querySelector('input');
var button = document.querySelector('button');
var service;


function mapFocus(lat, lng) {
  return new google.maps.LatLng(lat, lng);
}

function initMap () {
  new google.maps.Map(mapContainer, {
    center: mapFocus(42.956,-85.690),
    zoom: 12
  }); 
}

inputBox.addEventListener('input', function() {
  if (inputBox.value) {
    button.style.display = "block";
  }else {
    button.style.display = "none";
  }
});

button.addEventListener('submit', function() {
  new google.maps.places.PlacesService(map).textSearch(inputBox.value, callback);
});

initMap();

 // service = new google.maps.places.PlacesService(map);
  // service.textSearch(request, callback);
