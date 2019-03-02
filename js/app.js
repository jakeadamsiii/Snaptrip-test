//http request returning in JSON format
var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

//format url correctly for users location, fallback location, API KEY, parameters etc.
function formatUrl(){
  let userLatLng;
  getLocation()
   .then((position) => {
     userLatLng = position.coords;
     console.log(userLatLng)
   })
   .catch((err) => {
     console.error(err.message);
     userLatLng = false;
   });

   function generateUrl(){

   }
}


//getting JSON and dealing with error
// getJSON('https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJuVnRajzU3ogRpdz30sTIqkc&key=AIzaSyD137cSJRa1LV_8djUKFlUeGgHd9MNh4FU',
// function(err, data) {
//   if (err !== null) {
//     console.log('Something went wrong: ' + err);
//   } else {
//     let place = data.result
//   }
// });

//get users lat and lng
function getLocation() {

  var options = {
    enableHighAccuracy: true,
    maximumAge: 0
  };

  function success(pos) {
    var crd = pos.coords;

    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  return new Promise(function (success, error) {
    navigator.geolocation.getCurrentPosition(success, error, options);
  });
}


formatUrl();
