/////////////////////// START OF PSEUDOCODE ///////////////////////

// Prompt for user's postal code, store in variable
// Make call to Google Maps API for lat and lon, store in variables
// Store user choices for cuisine and price range
// Make call to Zomato for nearest restaurants using lat and lon
// Filter results by cuisine, delivery (if available), price
// Create an array of ids for final food results
// Store user choices for tv series or movie and genre
// Make call to MovieDB for most popular tv shows or movies in English (Discover endpoint)
// Filter results by genre
// Create an array of ids for final entertainment results

// Use random function to select 1 from restaurant array and entertainment array
// Make call to Zomato restaurant endpoint and store necessary info in an object
// Make call to MovieDB movie or tv show enpoint and store necessary info in an object
// Display title and photo in separate divs for each side by side
// Listen for click on div, then display additional information
// Listen for click on lock to save happy result and randomize for new result for unlocked div for new result

/////////////////////// END OF PSEUDOCODE ///////////////////////

const app = {
    map: {},    // for Google Maps
    zmt: {},     // for Zomato
    mdb: {}    // for MovieDB
} 

const map = app.map;    // so we don't have to keep writing app.whatever
const zmt = app.zmt;
const mdb = app.mdb;

//// do you think it's too much to separate functions by api?

////////////////
// MAP THINGS //
////////////////




/////////////////
// ZOMATO SHIZ //
/////////////////

// Zomato API data
zmt.key = '2c44fd9fe198e5be83cccbdfab8665f5'
zmt.url = 'https://developers.zomato.com/api/v2.1/'
// let lat = 43.6481870     // testing w HY coordinates
// let lon = -79.3979690    


// ajax request to Zomato geocode endpoint
zmt.geocodeCall = (lat, lon) => $.ajax({
    url: `${zmt.url}geocode`,
    method: 'GET',
    dataType: 'json',
    data: {
        apikey: zmt.key,
        lat: lat,
        lon: lon,
    }
}).then((res) => {
    // returns array of popular restaurants near lat and lon
    console.log(res.nearby_restaurants);
    return res.nearby_restaurants;
});


//////////////////
// MOVIEDB JUNK //
//////////////////




//////////////////// DOCUMENT READY ////////////////////

$(function(){

    zmt.geocodeCall(43.6481870, -79.3979690);

});