// DON'T FORGET !!!!!!!!!!!
// git pull upstream master
///////////////////////////


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
    zmt: {},     // for Zomato
    mdb: {}    // for MovieDB
} 

const zmt = app.zmt;
const mdb = app.mdb;

app.random = (arr) => {
    const index = arr[Math.floor(Math.random() * arr.length)];
    return index;
};

//// do you think it's too much to separate functions by api?


/////////////////
// ZOMATO SHIZ //
/////////////////

// Zomato API data
zmt.key = '2c44fd9fe198e5be83cccbdfab8665f5'
zmt.url = 'https://developers.zomato.com/api/v2.1/'


// let cuisine = (function() => {
//     $('form').on('submit', function (event) {
//       event.preventDefault();
//       const cuisine = $('input[name=cuisine]:checked').val();
//       console.log(cuisine);
//     });
// });

    zmt.price = 1
// ajax request to Zomato geocode endpoint
zmt.searchCall = (cuisine) => $.ajax({
    url: `${zmt.url}search`,
    method: 'GET',
    dataType: 'json',
    data: {
        apikey: zmt.key,
        entity_id: 89,
        entity_type: "city",
        category: 1,
        cuisines: cuisine,
    }
}).then((res) => {
    // returns array of restaurants in toronto by cuisine choice
    // console.log(res);
    //filter this array of restaurants to by price choice
    const restPriceList = res.restaurants.filter((rest) => {
        return rest.restaurant.price_range === zmt.price;
    });
    // console.log(restPriceList);
    
    // console.log(app.random(restPriceList));

    const userFinalChoice = app.random(restPriceList);
    console.log(userFinalChoice);
    
    //create object with: photo url, website address, address, user rating
    const userChoiceInfo = {
        name: userFinalChoice.restaurant.name,
        address: userFinalChoice.restaurant.location.address,
        url: userFinalChoice.restaurant.url,
        photos: userFinalChoice.restaurant.featured_image,
        rating: userFinalChoice.restaurant.user_rating.aggregate_rating
    }
    console.log(userChoiceInfo);

    let restaurantNameMarkup = `<div>
        <h2>${userChoiceInfo.name}</h2>
        </div>`
    let restaurantAddressMarkup = `<div>
        <h2>${userChoiceInfo.address}</h2>
        </div>`
    let restaurantUrlMarkup = `<div>
        <h2><a href=${userChoiceInfo.url}>Link to their Page</a></h2>
        </div>`
    let restaurantPhotoMarkup = `<div>
        <img src=${userChoiceInfo.photos}>
        </div>`
    let restaurantRatingMarkup = `<div>
        <h2>User Rating: ${userChoiceInfo.rating}</h2>
        </div>`
    // adding out html markup to
    $('.restResults').append(restaurantNameMarkup);
    $('.restResults').append(restaurantAddressMarkup);
    $('.restResults').append(restaurantUrlMarkup);
    // $('.restResults').append(restaurantPhotoMarkup);
    $('.restResults').append(restaurantRatingMarkup);
}); //* END OF AJAX CODE/ THEN STATEMENT *//


//////////////////
// MOVIEDB JUNK //
//////////////////

mdb.key = '2b03b1ad14b5664a21161db2acde3ab5'
mdb.url = 'https://api.themoviedb.org/3/'
mdb.imgUrl = 'https://image.tmdb.org/t/p/original'

mdb.tvGenre = 35
// tv IDs: action 10759, comedy 35, animation 16, crime 80, drama 18, reality 10764

mdb.tvCall = (genre, page = 1) => $.ajax({
    url: `${mdb.url}discover/tv`,
    method: 'GET',
    dataType: 'json',
    data: {
        api_key: mdb.key,
        sort_by: 'popularity.desc',
        with_original_language: 'en',
        page: page,
        with_genres: genre,
        genre_ids: genre
    }
}).then((res) => {
    console.log(res);
    const tvGenreList = res.results.map((tvSeries) => {
        return tvSeries;
    });
    // console.log(tvGenreList);
    const userTvGenreChoice = app.random(tvGenreList);
    console.log(userTvGenreChoice); // chooses a random tv show from the genre list

    const tvGenreInfo = {
        name: userTvGenreChoice.name,
        overview: userTvGenreChoice.overview,
        photos: userTvGenreChoice.poster_path,
        rating: userTvGenreChoice.vote_average
    }
    console.log(tvGenreInfo);

    let tvNameMarkup = `<div>
        <h2>${tvGenreInfo.name}</h2>
        </div>`
    let tvOverviewMarkup = `<div>
        <h2>${tvGenreInfo.overview}</h2>
        </div>`
    let tvPhotosMarkup = `<div>
        <img src="${mdb.imgUrl}${tvGenreInfo.photos}" alt="">
        </div>`
    let tvRatingsMarkup = `<div>
        <h2>${tvGenreInfo.rating}</h2>
        </div>`
    // // adding out html markup to
    $('.tvResults').append(tvNameMarkup);
    $('.tvResults').append(tvOverviewMarkup);
    $('.tvResults').append(tvPhotosMarkup);
    $('.tvResults').append(tvRatingsMarkup);
});

// movie IDs: action 28, comedy 35, crime 80, horror 27, drama 18, family 10751

mdb.movieCall = (genre, page = 1) => $.ajax({
    url: `${mdb.url}discover/movie`,
    method: 'GET',
    dataType: 'json',
    data: {
        api_key: mdb.key,
        sort_by: 'popularity.desc',
        with_original_language: 'en',
        page: page,
        with_genres: genre
    }
}).then((res) => {
    console.log(res);
    const movieGenreList = res.results.map((movieTitle) => {
        return movieTitle;
    });
    // console.log(movieGenreList);
    const userMovieGenreChoice = app.random(movieGenreList);
    console.log(userMovieGenreChoice); // chooses a random movie from the genre list

    const movieGenreInfo = {
        name: userMovieGenreChoice.title,
        overview: userMovieGenreChoice.overview,
        photos: userMovieGenreChoice.poster_path,
        rating: userMovieGenreChoice.vote_average
    }
    console.log(movieGenreInfo);

    let movieNameMarkup = `<div>
        <h2>${movieGenreInfo.name}</h2>
        </div>`
    let movieOverviewMarkup = `<div>
        <h2>${movieGenreInfo.overview}</h2>
        </div>`
    let moviePhotosMarkup = `<div>
        <img src="${mdb.imgUrl}${movieGenreInfo.photos}" alt="">
        </div>`
    let movieRatingsMarkup = `<div>
        <h2>Rating: ${movieGenreInfo.rating}</h2>
        </div>`
    // // adding out html markup to
    $('.movieResults').append(movieNameMarkup);
    $('.movieResults').append(movieOverviewMarkup);
    $('.movieResults').append(moviePhotosMarkup);
    $('.movieResults').append(movieRatingsMarkup);
});

mdb.tvDetails = (id) => $.ajax({
    url: `${mdb.url}/tv/{id}`,
    method: 'GET',
    dataType: 'json',
    data: {
        key: mdb.key,
        
    }  
});
//////////////////// DOCUMENT READY ////////////////////

$(function(){
    // console.log(zmt)
    zmt.searchCall("55");
    mdb.tvCall("35, 80");
    mdb.movieCall("35");
});