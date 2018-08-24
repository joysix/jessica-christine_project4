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
    zmt: {},
    mdb: {},
    fset: []
} 

const { zmt, mdb, fset } = app;

fset.entertainment = {
    tv: 'tv',
    movie: 'movies'
};

fset.movieIDs = {
    action: 28,
    comedy: 35,
    crime: 80,
    drama: 18,
    family: 10751,
    horror: 27,
};

fset.tvIDs = {
    action: 10759,
    animation: 16,
    comedy: 35,
    crime: 80,
    drama: 18,
    reality: 10764
};

fset.costs = {
    $: 1,
    $$: 2,
    $$$: 3,
    $$$$: 4
};

fset.cuisines = {
    canadian: 381,
    italian: 55,
    japanese: 60,
    mexican: 73,
    thai: 95,
    vegetarian: 308
};

const { entertainment, movieIDs, tvIDs, costs, cuisines } = fset


////////////////////////
// REUSABLE FUNCTIONS //
////////////////////////

app.random = (arr) => {
    const index = arr[Math.floor(Math.random() * arr.length)];
    return index;
};

//
app.markupBuilder = (obj, category) => {
    const fieldset = $(`<fieldset>`).addClass(category)
    $('form').append(fieldset);
    for (let key in obj) { 
        const option = `
          <div>
            <input type="radio" id="${key} ${category}" name="${category}" value="${obj[key]}"/>
            <label for="${key} ${category}" id="${key} ${category}">${key}</label>
          </div>`
        $(`.${category}`).append(option);
    }
};


/////////////////
// ZOMATO SHIZ //
/////////////////

// Zomato API data
zmt.key = '2c44fd9fe198e5be83cccbdfab8665f5'
zmt.url = 'https://developers.zomato.com/api/v2.1/'
zmt.price;
zmt.cuisine;


// ajax request to Zomato search endpoint
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
})
.then((res) => {        // returns restaurants in Toronto by cuisine choice
    // filters response by price choice
    const restoListbyPrice = res.restaurants.filter((resto) => {
        return resto.restaurant.price_range === zmt.price;
    });

    // randomly selects one restaurant from call
    const randomResto = app.random(restoListbyPrice);
    const restoToPrint = randomResto.restaurant;
    
    // object with: photo url, website address, address, user rating
    const restaurant = {
        name: restoToPrint.name,
        address: restoToPrint.location.address,
        url: restoToPrint.url,
        photos: restoToPrint.featured_image,
        rating: restoToPrint.user_rating.aggregate_rating
    }

    // building HTML markup
    const restaurantNameMarkup = `<div>
        <h2>${restaurant.name}</h2>
        </div>`

    const restaurantAddressMarkup = `<div>
        <h2>${restaurant.address}</h2>
        </div>`

    const restaurantUrlMarkup = `<div>
        <h2><a href=${restaurant.url}>Link to their Page</a></h2>
        </div>`

    const restaurantPhotoMarkup = `<div>
        <img src=${restaurant.photos}>
        </div>`

    const restaurantRatingMarkup = `<div>
        <h2>User Rating: ${restaurant.rating}</h2>
        </div>`


    // appending markup to restoResult div
    $('.restoResult').append(restaurantAddressMarkup);
    $('.restoResult').append(restaurantNameMarkup);
    $('.restoResult').append(restaurantUrlMarkup);
    // $('.restoResult').append(restaurantPhotoMarkup);
    $('.restoResult').append(restaurantRatingMarkup);
}); //* END OF ZOMATO THEN STATEMENT *//


//////////////////
// MOVIEDB JUNK //
//////////////////

//// if user chooses tv ////////////////

mdb.key = '2b03b1ad14b5664a21161db2acde3ab5';
mdb.url = 'https://api.themoviedb.org/3/';
mdb.imgBaseUrl = 'https://image.tmdb.org/t/p/original';
mdb.trailerBaseUrl = 'https://www.youtube.com/watch?v=';
mdb.type;
mdb.tvGenre;
mdb.movieGenre;

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
})
.then((res) => { // returns tv series by genre choice
    // narrows down response to results key
    const tvListByGenre = res.results;

    // randomly selects one show from call
    const showToPrint = app.random(tvListByGenre);

    // chooses a random tv show from the genre list
    const tvShow = {
        name: showToPrint.name,
        overview: showToPrint.overview,
        photos: showToPrint.poster_path,
        rating: showToPrint.vote_average
    };

    // building HTML markup
    let tvNameMarkup = `<div>
        <h2>${tvShow.name}</h2>
        </div>`;

    let tvOverviewMarkup = `<div>
        <h2>${tvShow.overview}</h2>
        </div>`;

    let tvPhotosMarkup = `<div>
        <img src="${mdb.imgBaseUrl}${tvShow.photos}" alt="">
        </div>`;

    let tvRatingsMarkup = `<div>
        <h2>${tvShow.rating}</h2>
        </div>`;

    // appending markup to tvResult div
    $('.tvResults').append(tvNameMarkup);
    $('.tvResults').append(tvOverviewMarkup);
    $('.tvResults').append(tvPhotosMarkup);
    $('.tvResults').append(tvRatingsMarkup);
});

//// if user chooses movies ////////////////

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
    // narrows down response to results key
    const movieListByGenre = res.results;

    // randomly selects one movie from call
    const movieToPrint = app.random(movieListByGenre);

    const movie = {
        name: movieToPrint.title,
        overview: movieToPrint.overview,
        photos: movieToPrint.poster_path,
        rating: movieToPrint.vote_average
    }

    // building HTML markup
    let movieNameMarkup = `<div>
        <h2>${movie.name}</h2>
        </div>`;

    let movieOverviewMarkup = `<div>
        <h2>${movie.overview}</h2>
        </div>`;
        
    let moviePhotosMarkup = `<div>
        <img src="${mdb.imgUrl}${movie.photos}" alt="">
        </div>`;

    let movieRatingsMarkup = `<div>
        <h2>Rating: ${movie.rating}</h2>
        </div>`;

    // appending markup to movieResult div
    $('.movieResult').append(movieNameMarkup);
    $('.movieResult').append(movieOverviewMarkup);
    $('.movieResult').append(moviePhotosMarkup);
    $('.movieResult').append(movieRatingsMarkup);
});

mdb.trailerCall = (type, id) => $.ajax({
    url: `${mdb.url}${type}/${id}/videos`,
    method: 'GET',
    dataType: 'json',
    data: {
        api_key: mdb.key

    }  
}).then((res) => {
    console.log(res.results);

    // filters response by availability on YouTube
    const trailerList = res.results.filter((trailer) => {
        return trailer.site === "YouTube" && trailer.type === "Trailer";
    });


});


//////////////////// DOCUMENT READY ////////////////////

$(function(){
    // console.log('hi');
    console.log(app);
    // zmt.searchCall("55");
    // mdb.tvCall("35, 80");
    // mdb.movieCall("35");

    // mdb.trailerCall("tv", 48891);

});