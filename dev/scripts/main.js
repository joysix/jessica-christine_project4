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

const app = {};

app.zmt = {};

app.mdb = {};

app.fset = [];

app.pref = {};

app.res = {};

// app.call = {
//     resto: 0,
//     tv: 0,
//     movie: 0
// };

const { zmt, mdb, fset, pref, res } = app;

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
    $$$: 3
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
app.ratingMarkup = (rating, type) => {
    const num = Number(rating); 

    // rounds rating to nearest 0.5
    const roundedRating = Math.round(num * 2) / 2;

    // checks if half point exists
    const half = roundedRating % (Math.floor(roundedRating))

    let rest;

    if (type === 'restaurant') {
        rest = 5 - Math.ceil(roundedRating);
    } else {
        rest = 10 - Math.ceil(roundedRating);
    }

    // declares variable where final markup will be stored
    let final;

    const star = `<i class="fas fa-star"></i>`;
    const halfStar = `<i class="fas fa-star-half-alt"></i>`
    const empty = `<i class="far fa-star"></i>`;

    // if result includes half point, add half a star
    // if not, use only whole stars
    if (num === 0) {
        final = 'Not yet rated';
    } else if (half) {
        final = star.repeat(roundedRating) + halfStar + empty.repeat(rest);
    } else {
        final = star.repeat(roundedRating) + empty.repeat(rest);
    }

    // returns final markup
    return final;
}

app.newRestoOption = () => {
    $('.callAgain.restaurant').off('click');
    $('.callAgain.restaurant').on('click', () => {
        // $('.result.restaurant').remove();
        // zmt.restaurantCall(pref.cuisine, pref.price);
        console.log('restaurantCall');
    });
};

app.newTvOption = () => {
    $('.callAgain.tvshow').off('click');
    $('.callAgain.tvshow').on('click', () => {
        // $('.result.tvshow').remove();
        // mdb.tvCall(pref.tvGenre);
        console.log('tvCall');
    });
};

app.newMovieOption = () => {
    $('.callAgain.movie').off('click');
    $('.callAgain.movie').on('click', () => {
        // $('.result.movie').remove();
        // mdb.movieCall(pref.movieGenre);
        console.log('movieCall');
    });
};

// constructs result div markup
app.resultMarkup = (obj) => {

    let bg;

    if (!obj.bg) {
        bg = obj.bg2;
    } else {
        bg = obj.bg
    }

    // creates containing div with background image
    const resultContainer = $('<div>').addClass(`result ${obj.type}`).css('background-image', `url('${bg}')`);

    // appends empty result container to body container
    $('.resultsPage').append(resultContainer);
    
    // creates rating markup
    const ratingMarkup = app.ratingMarkup(obj.rating, obj.type);
    
    // creates text with title, detail, rating
    // const callAgain = `<button class="callAgain">Gimme another</button>`;

    const result = `<h2>${obj.h2}</h2>
        <p>${obj.p}</p>
        <div class="rating ${obj.type}">${ratingMarkup}</div>
        <button class="callAgain ${obj.type}">Gimme another</button>`;
    
    // appends final result markup to result container
    $(`.${obj.type}`).append(result);
    
    app.newRestoOption();
    app.newTvOption();
    app.newMovieOption();
};


app.trailerMarkup = (key) => {
    const embed = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    
    $('.movie .result').on('click', function(){
        resultsPage.append(embed);  // STILL NEED TO TARGET SPECIFIC DIV
    });
}



/////////////////
// ZOMATO SHIZ //
/////////////////

// Zomato API data
zmt.key = '2c44fd9fe198e5be83cccbdfab8665f5'
zmt.url = 'https://developers.zomato.com/api/v2.1/'

// ajax request to Zomato search endpoint
zmt.restaurantCall = (cuisine, price, start = 0) => $.ajax({
    url: `${zmt.url}search`,
    method: 'GET',
    dataType: 'json',
    data: {
        apikey: zmt.key,
        entity_id: 89,
        entity_type: 'city',
        q: 'Toronto',
        start: start,
        cuisines: cuisine,
        category: 1,
        sort: 'rating',
        order: 'desc'
    }
})
.then((res) => {        // returns restaurants in Toronto by cuisine choice
    // filters response by price choice
    const restoListbyPrice = res.restaurants.filter((resto) => {
        return resto.restaurant.price_range === Number(price);
    });

    // randomly selects one restaurant from call
    const randomResto = app.random(restoListbyPrice);
    const restoToPrint = randomResto.restaurant;
    
    let cuisineKey;
    
    for (let key in fset.cuisines) {
        if (fset.cuisines[key] === Number(cuisine)) {
            cuisineKey = key;
        };
    }
    
    // object with address, user rating, photo url, zomato link
    const restaurant = {
        type: 'restaurant',
        h2: restoToPrint.name,
        p: restoToPrint.location.address,
        rating: restoToPrint.user_rating.aggregate_rating,
        bg: restoToPrint.featured_image,
        bg2: `../../assets/${cuisineKey}.jpg`,
        url: restoToPrint.url
    }
    
    console.log(restaurant.h2);
    app.resultMarkup(restaurant);

}); //* END OF ZOMATO THEN STATEMENT *//


//////////////////
// MOVIEDB JUNK //
//////////////////

mdb.key = '2b03b1ad14b5664a21161db2acde3ab5';
mdb.url = 'https://api.themoviedb.org/3/';
mdb.imgBaseUrl = 'https://image.tmdb.org/t/p/original/';
mdb.trailerBaseUrl = 'https://www.youtube.com/watch?v=';

//// if user chooses tv ////////////////

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
        type: 'tvshow',
        h2: showToPrint.name,
        p: showToPrint.overview,
        rating: showToPrint.vote_average,
        bg: mdb.imgBaseUrl + showToPrint.backdrop_path,
        bg2: mdb.imgBaseUrl + showToPrint.poster_path
    };

    console.log(tvShow.h2);
    app.resultMarkup(tvShow);
    
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
        id: movieToPrint.id,
        type: 'movie',
        h2: movieToPrint.title,
        p: movieToPrint.overview,
        rating: movieToPrint.vote_average,
        bg: mdb.imgBaseUrl+movieToPrint.backdrop_path,
        bg2: mdb.imgBaseUrl+movieToPrint.poster_path
    }

    app.resultMarkup(movie);
    mdb.trailerCall(movie.type, movie.id);
});

mdb.trailerCall = (type, id) => $.ajax({
    url: `${mdb.url}${type}/${id}/videos`,
    method: 'GET',
    dataType: 'json',
    data: {
        api_key: mdb.key

    }  
}).then((res) => {

    // filters response by availability on YouTube
    const trailerList = res.results.filter((trailer) => {
        return trailer.site === "YouTube" && trailer.type === "Trailer";
    });

    const trailerKey = trailerList[0].key

    app.trailerMarkup(trailerKey)
});


//////////////////// DOCUMENT READY ////////////////////


app.populateNext = (id, obj, type, remove) => {
    $('form').on('click', id, function () {
        $(remove).remove();
        app.fsetMarkup(obj, type);
    });
}


// SUBMIT FORM FUNCTION
app.submit = () => {
    $('form').on('submit', function(event){
        event.preventDefault();
        pref.entertainment = $('input[name=entertainment]:checked').val();
        pref.tvGenre = $('input[name=tvGenres]:checked').val();
        pref.movieGenre = $('input[name=movieGenres]:checked').val();
        pref.cuisine = $('input[name=cuisines]:checked').val();
        pref.price = $('input[name=costs]:checked').val();
        console.log(pref);
        zmt.restaurantCall(pref.cuisine, pref.price);
        if(pref.tvGenre === undefined) {
            mdb.movieCall(pref.movieGenre);
        } else if(pref.movieGenre === undefined) {
            mdb.tvCall(pref.tvGenre);
        }  
        $('.formPage').css('display', 'none');
        $('.resultsPage').css('display', 'grid');
    }); 
}


app.formInit = () => {
    app.fsetMarkup(entertainment, "entertainment");
    app.fsetMarkup(cuisines, "cuisines");
    app.populateNext('#tv', tvGenres, "tvGenres", ".remove");
    app.populateNext('#movie', movieGenres, "movieGenres", ".remove");
    for(let cuisine in cuisines) {
        app.populateNext(`#${cuisine}`, costs, "costs", ".priceRemove");
    }
    app.submit();
}

app.init = () => {
    $('button').on('click', function(){
        $('.mainStartPage').css('display', 'none');
        $('.formPage').css('display', 'grid');
    });
    app.formInit();
}

$(function(){
    app.init();
}); // END OF DOCUMENT READY
