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
     userLatLng = [position.coords.latitude,position.coords.longitude];
     generateUrl(userLatLng);
   })
   .catch((err) => {
     userLatLng = [51.508596, -0.108000];
     generateUrl(userLatLng);
   });

   function generateUrl(latLng){
     const baseUrl = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
     const API_KEY = 'AIzaSyD137cSJRa1LV_8djUKFlUeGgHd9MNh4FU';

     let finalUrl = `${baseUrl}location=${latLng}&radius=1500&key=${API_KEY}`;

     //getting JSON and dealing with errors
     getJSON(finalUrl,
     function(err, data) {
       if (err !== null) {
         console.log('Something went wrong: ' + err);
       } else {
         //success responce
         let places = data.results;
         //for every place we need to fetch photos, find website and generate the html
         places.forEach(place=>{
           //find webite using seperate json request
           let website = getJSON(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=${place.place_id}&fields=website&key=AIzaSyD137cSJRa1LV_8djUKFlUeGgHd9MNh4FU`,
           function(err, data){
               if (err !== null) {
                 let website = null;
                 getPhotoUrl(place)
                 generateHTML(place, website, latLng)
               } else {
                  let website = data.result.website;
                  getPhotoUrl(place)
                  generateHTML(place, website, latLng)
               }
           });
           //CORS issue - no access control allow origin header on local host
           //TODO - fix error or see if the error continues once hosted.
           function getPhotoUrl(place){
              // getJSON('https://cors.io/https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=CnRtAAAATLZNl354RwP_9UKbQ_5Psy40texXePv4oAlgP4qNEkdIrkyse7rPXYGd9D_Uj1rVsQdWT4oRz4QrYAJNpFX7rzqqMlZw2h2E2y5IKMUZ7ouD_SlcHxYq1yL4KbKUv3qtWgTK0A6QbGh87GB3sscrHRIQiG2RrmU_jF4tENr9wGS_YxoUSSDrYjWmrNfeEHSGSc3FyhNLlBU&key=AIzaSyD137cSJRa1LV_8djUKFlUeGgHd9MNh4FU',
              // function(err, data) {
              //   if (err !== null) {
              //     console.log('Something went wrong: ' + err);
              //   } else {
              //     console.log(data)
              //   }
              //});
           }

           //function to generate the html
           function generateHTML(place, website, latLng){
             let placeContent ='';
             //limit type of place to 3 for display purposes + deal with special characters
             let typeOfArr = place.types.slice(0,3);
             var newArr=[];
             typeOfArr.forEach(type=>{
               var typeLi = `<li class="places__type btn">${type.replace(/_/g,' ')}</li>`;
               newArr.push(typeLi);
             });

            let distanceFromMe = distance(latLng[0],latLng[1],place.geometry.location.lat,place.geometry.location.lng);

            //distance in lat/long calcuation
            function distance(lat1,lon1,lat2,lon2) {
            	var R = 6371; // km (change this constant to get miles)
            	var dLat = (lat2-lat1) * Math.PI / 180;
            	var dLon = (lon2-lon1) * Math.PI / 180;
            	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            		Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
            		Math.sin(dLon/2) * Math.sin(dLon/2);
            	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            	var d = R * c;
            	if (d>1) return Math.round(d)+"km";
            	else if (d<=1) return Math.round(d*1000)+"m";
            	return d;
            }
            
            //generate opening hrs html
            var openingContent ='';
            if(place.opening_hours){
              if(place.opening_hours.open_now === true){
                openingContent = `
                <div class='places__opening places__opening--open'>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2bcf1c" stroke-width="3" stroke-linecap="square" stroke-linejoin="arcs"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Open Now</span>
                </div>`
              }else{
                openingContent = `
                <div class='places__opening places__opening--closed'>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#cf1c1c" stroke-width="3" stroke-linecap="square" stroke-linejoin="arcs"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span>Closed</span>
                </div>`
              }
            }

            //generate ratings html if a place has ratings
            var ratingContent ='';
            if(place.rating){
              ratingContent =`
              <p class="places__rating">
                ${place.rating}
                <img class="places__rating-star" src="../star.png" alt="stars">
                <span class="places__rating-total"> (${place.user_ratings_total})</span>
              </p>
              `
            }

            var innerLink=`
            <div class="places__image">
            ${openingContent}
          </div>
            <div class='places__info'>
              <p class="places__location">${place.vicinity}</p>
              <h4 class="places__name">${place.name}</h4>
              <div class="places__distance-info-box">
                  ${ratingContent}
                <p class="places__distance">${distanceFromMe} away</p>
              </div>
              <ul class="places__type-list">
                ${newArr.join('')}
              </ul>
            </div>`;


             if(website){
               placeContent = `
                  <li class="places__card" data-distance="${parseInt(distanceFromMe.replace(/km/gi,'000'))}" data-rating="${place.rating}">
                    <a href='${website}' target='_blank'>
                      ${innerLink}
                    </a>
                  </li>
                `
             }else{
               placeContent = `
                  <li class="places__card" data-distance="${parseInt(distanceFromMe.replace(/km/gi,'000'))}" data-rating="${place.rating}">
                     ${innerLink}
                  </li>`
             }

              document.querySelector('.places__list').insertAdjacentHTML('afterbegin', placeContent);
              setTimeout(function(){
                document.querySelector('.loading').classList.add('loading--inactive');
                //after loading fade animation end
                setTimeout(function(){
                  document.querySelector('.loading').classList.add('loading--stopped');
                },1000);
              }, 2000);
           }

         });

       }
     });
   }
}


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

var distanceButton = document.querySelector('.distance-btn');
var ratingButton = document.querySelector('.rating-btn');
distanceButton.addEventListener("click", sortClick);
ratingButton.addEventListener("click", sortClick);

//generic sorting function that will sort high to low for both distance and rating 
function sortClick(e){
  var parameter = ''
  var listItems = document.querySelectorAll('.places__card');
  var placesList = document.querySelector('.places__list');
  if(e.target === distanceButton){
    parameter = 'distance';
    var listArr = [].slice.call(listItems).sort(function(a, b) {
      return +a.getAttribute(`data-${parameter}`) - +b.getAttribute(`data-${parameter}`);
    });
  }else{
    parameter = 'rating';
    var listArr = [].slice.call(listItems).sort(function(a, b) {
      return +b.getAttribute(`data-${parameter}`) - +a.getAttribute(`data-${parameter}`);
    });
  }

  //remove all children
  while (placesList.firstChild) {
    placesList.removeChild(placesList.firstChild);
  }

  //add new sorted list
  listArr.forEach(function (p) {
      placesList.appendChild(p);
  });
}
