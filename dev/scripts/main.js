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

fset.movieGenres = {
    action: 28,
    comedy: 35,
    crime: 80,
    drama: 18,
    family: 10751,
    horror: 27,
};

fset.tvGenres = {
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

const { entertainment, movieGenres, tvGenres, costs, cuisines } = fset


////////////////////////
// REUSABLE FUNCTIONS //
////////////////////////

app.random = (arr) => {
    const index = arr[Math.floor(Math.random() * arr.length)];
    return index;
};

// constructs fieldset markup in form
app.fsetMarkup = (obj, category) => {
    // creates a empty fieldset
    const fieldset = $(`<fieldset>`).addClass(category).attr('id', category)
    // appends fieldset to the form
    $('form').prepend(fieldset);
    // iterates through the object and creates a radio input for each key
    for (let key in obj) {
        const option = `
          <div>
            <input type="radio" id="${key}" name="${category}" value="${obj[key]}"/>
            <label for="${key}">${key}</label>
          </div>`
          // appends the option (input+label) to the fieldset
        $(`.${category}`).append(option);
    }
    $('.tvGenres').addClass('remove');
    $('.movieGenres').addClass('remove');
    $('.costs').addClass('priceRemove');
};

// constructs rating div markup 
app.ratingMarkup = (num) => {
    // rounds rating to nearest 0.5
    const rating = Math.round(num * 2) / 2;

    // checks if half point exists
    const half = rating % (Math.floor(rating))

    // declares variable where final markup will be stored
    let final;
    
    //  if result includes half point, add half a star
    if(half){
        final = 'star '.repeat(rating) + 'st';
    }
    
    //  if not, use only whole stars
    else {
        // final = 'star '.repeat(rating);
    }
    
    console.log(final);
    // returns final markup
    return final;
}

// constructs result div markup
app.resultMarkup = (obj) => {
    // creates containing div with background image
    const resultContainer = $('<div>').addClass(obj.type).css('background-image', `url('${obj.bg}')`);
// console.log(resultContainer);

    // appends empty result container to body container
    $('.container').append(resultContainer);
    
    // creates rating markup
    const ratingMarkup = app.ratingMarkup(obj.rating);
// console.log(ratingMarkup);
    
    // creates text with title, detail, rating
    const result = `<h2>${obj.name}</h2>
        <p>${obj.detail}</p>
        <div class="rating ${obj.type}">${ratingMarkup}</div>`;
// console.log(result);
    
    // appends final result markup to result container
    $(`.${obj.type}`).append(result);
};


/////////////////
// ZOMATO SHIZ //
/////////////////

// Zomato API data
zmt.key = '2c44fd9fe198e5be83cccbdfab8665f5'
zmt.url = 'https://developers.zomato.com/api/v2.1/'

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
        type: 'restaurant',
        h2: restoToPrint.name,
        p: restoToPrint.location.address,
        rating: restoToPrint.user_rating.aggregate_rating,
        bg: restoToPrint.featured_image,
        bg2: '',
        url: restoToPrint.url
    }

    app.resultMarkup(restaurant);

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
    console.log(res.results)

    // randomly selects one show from call
    const showToPrint = app.random(tvListByGenre);

    // chooses a random tv show from the genre list
    const tvShow = {
        type: 'tvshow',
        h2: showToPrint.name,
        p: showToPrint.overview,
        rating: showToPrint.vote_average,
        bg: showToPrint.backdrop_path,
        bg2: showToPrint.poster_path
    };
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
        type: 'movie',
        h2: movieToPrint.title,
        p: movieToPrint.overview,
        rating: movieToPrint.vote_average,
        bg: movieToPrint.backdrop_path,
        bg2: movieToPrint.poster_path
    }

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

app.trailerMarkup = (key) => {
    const embed =`<iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    // $('div').append(embed); // STILL NEED TO TARGET SPECIFIC DIV
}

//////////////////// DOCUMENT READY ////////////////////


app.populateNext = (id, obj, type, remove) => {
    $('form').on('click', id, function () {
        $(remove).remove();
        app.fsetMarkup(obj, type);
        console.log(id, obj, type, remove);
    });
}


// SUBMIT FORM FUNCTION
$('form').on('submit', function(event){
    event.preventDefault();
    const entertainmentType = $('input[name=entertainment]:checked').val();
    const tvGenreType = $('input[name=tvGenres]:checked').val();
    const movieGenreType = $('input[name=movieGenres]:checked').val();
    const cuisineType = $('input[name=cuisines]:checked').val();
    const priceType = $('input[name=costs]:checked').val();
}); 

app.init = () => {
    app.fsetMarkup(entertainment, "entertainment");
    app.fsetMarkup(cuisines, "cuisines");
    app.populateNext('#tv', tvGenres, "tvGenres", ".remove");
    app.populateNext('#movie', movieGenres, "movieGenres", ".remove");
    for(let cuisine in cuisines) {
        app.populateNext(`#${cuisine}`, costs, "costs", ".priceRemove");
    }

}

$(function(){

app.init();

}); // END OF DOCUMENT READY
