(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

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

var app = {};

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

var zmt = app.zmt,
    mdb = app.mdb,
    fset = app.fset,
    pref = app.pref,
    res = app.res;


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
    horror: 27
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

var entertainment = fset.entertainment,
    movieGenres = fset.movieGenres,
    tvGenres = fset.tvGenres,
    costs = fset.costs,
    cuisines = fset.cuisines;

////////////////////////
// REUSABLE FUNCTIONS //
////////////////////////

app.random = function (arr) {
    var index = arr[Math.floor(Math.random() * arr.length)];
    return index;
};

// constructs fieldset markup in form
app.fsetMarkup = function (obj, category) {
    // creates a empty fieldset
    var fieldset = $('<fieldset>').addClass(category).attr('id', category);
    // appends fieldset to the form
    $('form').prepend(fieldset);
    // iterates through the object and creates a radio input for each key
    for (var key in obj) {
        var option = '\n          <div>\n            <input type="radio" id="' + key + '" name="' + category + '" value="' + obj[key] + '"/>\n            <label for="' + key + '">' + key + '</label>\n          </div>';
        // appends the option (input+label) to the fieldset
        $('.' + category).append(option);
    }
    $('.tvGenres').addClass('remove');
    $('.movieGenres').addClass('remove');
    $('.costs').addClass('priceRemove');
};

// constructs rating div markup 
app.ratingMarkup = function (rating, type) {
    var num = Number(rating);

    // rounds rating to nearest 0.5
    var roundedRating = Math.round(num * 2) / 2;

    // checks if half point exists
    var half = roundedRating % Math.floor(roundedRating);

    var rest = void 0;

    if (type === 'restaurant') {
        rest = 5 - Math.ceil(roundedRating);
    } else {
        rest = 10 - Math.ceil(roundedRating);
    }

    // declares variable where final markup will be stored
    var final = void 0;

    var star = '<i class="fas fa-star"></i>';
    var halfStar = '<i class="fas fa-star-half-alt"></i>';
    var empty = '<i class="far fa-star"></i>';

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
};

app.newRestoOption = function () {
    $('.callAgain.restaurant').off('click');
    $('.callAgain.restaurant').on('click', function () {
        $('.result.restaurant').remove();
        zmt.restaurantCall(pref.cuisine, pref.price);
    });
};

app.newTvOption = function () {
    $('.callAgain.tv').off('click');
    $('.callAgain.tv').on('click', function () {
        $('.result.tv').remove();
        mdb.tvCall(pref.tvGenre);
    });
};

app.newMovieOption = function () {
    $('.callAgain.movie').off('click');
    $('.callAgain.movie').on('click', function () {
        $('.result.movie').remove();
        mdb.movieCall(pref.movieGenre);
    });
};

app.watchTrailer = function () {
    $('.watchTrailer').off('click');
    $('.watchTrailer').on('click', function () {
        $('.trailerPage').toggleClass('show');
    });
};

app.closeTrailer = function () {
    $('.closeTrailer').off('click');
    $('.closeTrailer').on('click', function () {
        $('.trailerPage').toggleClass('show');
    });
};

// constructs result div markup
app.resultMarkup = function (obj) {

    var bg = void 0;

    if (!obj.bg) {
        bg = obj.bg2;
    } else {
        bg = obj.bg;
    }

    // creates containing div with background image
    var resultContainer = $('<div>').addClass('result ' + obj.type).css('background-image', 'url(\'' + bg + '\')');

    // appends empty result container to body container
    $('.resultsPage').append(resultContainer);

    // creates rating markup
    var ratingMarkup = app.ratingMarkup(obj.rating, obj.type);

    // creates text with title, detail, rating

    var result = '<div class="text ' + obj.type + '">\n        <a href="' + obj.url + '"><h3>' + obj.h3 + '</h3></a>\n        <p>' + obj.p + '</p>\n    </div>\n    <div class="rating ' + obj.type + '">' + ratingMarkup + '</div>\n    <button class="callAgain ' + obj.type + '">Gimme another</button>';

    // appends final result markup to result container
    $('.' + obj.type).append(result);

    var trailer = mdb.trailerCall(obj.type, obj.id);

    if (trailer) {
        if (obj.type === "tv" || obj.type === "movie") {
            var watchTrailer = '<button class="watchTrailer">Trailer</button>';
            $('.text.' + obj.type).append(watchTrailer);
        }
    }

    app.newRestoOption();
    app.newTvOption();
    app.newMovieOption();
    app.watchTrailer();
    app.closeTrailer();
};

app.trailerMarkup = function (key) {
    $('.trailer').remove();
    if (key === 0) {
        var sorry = '<p class="trailer">Sorry, no trailer available!</p>';
        $('.trailerPage').append(sorry);
    } else {
        var embed = '<iframe class="trailer" width="560" height="315" src="https://www.youtube.com/embed/' + key + '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        $('.trailerPage').append(embed);
    }
};

/////////////////
// ZOMATO SHIZ //
/////////////////

// Zomato API data
zmt.key = '2c44fd9fe198e5be83cccbdfab8665f5';
zmt.url = 'https://developers.zomato.com/api/v2.1/';

// ajax request to Zomato search endpoint
zmt.restaurantCall = function (cuisine, price) {
    var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    return $.ajax({
        url: zmt.url + 'search',
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
    }).then(function (res) {
        // returns restaurants in Toronto by cuisine choice
        // filters response by price choice
        var restoListbyPrice = res.restaurants.filter(function (resto) {
            return resto.restaurant.price_range === Number(price);
        });

        // randomly selects one restaurant from call
        var randomResto = app.random(restoListbyPrice);
        var restoToPrint = randomResto.restaurant;

        var cuisineKey = void 0;

        for (var key in fset.cuisines) {
            if (fset.cuisines[key] === Number(cuisine)) {
                cuisineKey = key;
            };
        }

        // object with address, user rating, photo url, zomato link
        var restaurant = {
            type: 'restaurant',
            h3: restoToPrint.name,
            p: restoToPrint.location.address,
            rating: restoToPrint.user_rating.aggregate_rating,
            bg: restoToPrint.featured_image,
            bg2: '../../assets/' + cuisineKey + '.jpg',
            url: restoToPrint.url
        };

        app.resultMarkup(restaurant);
    });
}; //* END OF ZOMATO THEN STATEMENT *//


//////////////////
// MOVIEDB JUNK //
//////////////////

mdb.key = '2b03b1ad14b5664a21161db2acde3ab5';
mdb.url = 'https://api.themoviedb.org/3/';
mdb.imgBaseUrl = 'https://image.tmdb.org/t/p/original/';
mdb.trailerBaseUrl = 'https://www.youtube.com/watch?v=';

mdb.trailerCall = function (type, id) {
    return $.ajax({
        url: '' + mdb.url + type + '/' + id + '/videos',
        method: 'GET',
        dataType: 'json',
        data: {
            api_key: mdb.key

        }
    }).then(function (res) {

        // filters response by availability on YouTube
        var trailerList = res.results.filter(function (trailer) {
            return trailer.site === "YouTube" && trailer.type === "Trailer";
        });

        if (!trailerList[0]) {
            app.trailerMarkup(0);
        } else {
            var trailerKey = trailerList[0].key;
            app.trailerMarkup(trailerKey);
        }
    });
};

//// if user chooses tv ////////////////

mdb.tvCall = function (genre) {
    var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    return $.ajax({
        url: mdb.url + 'discover/tv',
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
    }).then(function (res) {
        // returns tv series by genre choice
        // narrows down response to results key
        var tvListByGenre = res.results;
        console.log(tvListByGenre);
        // randomly selects one show from call
        var showToPrint = app.random(tvListByGenre);

        // chooses a random tv show from the genre list
        var tvShow = {
            id: showToPrint.id,
            type: 'tv',
            h3: showToPrint.name,
            p: showToPrint.overview,
            rating: showToPrint.vote_average,
            bg: mdb.imgBaseUrl + showToPrint.backdrop_path,
            bg2: mdb.imgBaseUrl + showToPrint.poster_path,
            url: 'https://www.themoviedb.org/tv/' + showToPrint.id
        };

        app.resultMarkup(tvShow);
    });
};

//// if user chooses movies ////////////////

mdb.movieCall = function (genre) {
    var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    return $.ajax({
        url: mdb.url + 'discover/movie',
        method: 'GET',
        dataType: 'json',
        data: {
            api_key: mdb.key,
            sort_by: 'popularity.desc',
            with_original_language: 'en',
            page: page,
            with_genres: genre
        }
    }).then(function (res) {
        // narrows down response to results key
        var movieListByGenre = res.results;

        // randomly selects one movie from call
        var movieToPrint = app.random(movieListByGenre);

        var movie = {
            id: movieToPrint.id,
            type: 'movie',
            h3: movieToPrint.title,
            p: movieToPrint.overview,
            rating: movieToPrint.vote_average,
            bg: mdb.imgBaseUrl + movieToPrint.backdrop_path,
            bg2: mdb.imgBaseUrl + movieToPrint.poster_path,
            url: 'https://www.themoviedb.org/movie/' + movieToPrint.id
        };

        app.resultMarkup(movie);
    });
};

//////////////////// DOCUMENT READY ////////////////////


app.populateNext = function (id, obj, type, remove) {
    $('form').on('click', id, function () {
        $(remove).remove();
        app.fsetMarkup(obj, type);
    });
};

// SUBMIT FORM FUNCTION
app.submit = function () {
    $('form').on('submit', function (event) {
        event.preventDefault();
        pref.entertainment = $('input[name=entertainment]:checked').val();
        pref.tvGenre = $('input[name=tvGenres]:checked').val();
        pref.movieGenre = $('input[name=movieGenres]:checked').val();
        pref.cuisine = $('input[name=cuisines]:checked').val();
        pref.price = $('input[name=costs]:checked').val();
        console.log(pref);
        zmt.restaurantCall(pref.cuisine, pref.price);
        if (pref.tvGenre === undefined) {
            mdb.movieCall(pref.movieGenre);
        } else if (pref.movieGenre === undefined) {
            mdb.tvCall(pref.tvGenre);
        }
        $('.formPage').css('display', 'none');
        $('.resultsPage').css('display', 'grid');
    });
};

app.formInit = function () {
    app.fsetMarkup(entertainment, "entertainment");
    app.fsetMarkup(cuisines, "cuisines");
    app.populateNext('#tv', tvGenres, "tvGenres", ".remove");
    app.populateNext('#movie', movieGenres, "movieGenres", ".remove");
    for (var cuisine in cuisines) {
        app.populateNext('#' + cuisine, costs, "costs", ".priceRemove");
    }
    app.submit();
};

app.init = function () {
    $('button').on('click', function () {
        $('.mainStartPage').css('display', 'none');
        $('.formPage').css('display', 'grid');
    });
    app.formInit();
};

$(function () {
    app.init();
}); // END OF DOCUMENT READY

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxJQUFNLE1BQU0sRUFBWjs7QUFFQSxJQUFJLEdBQUosR0FBVSxFQUFWOztBQUVBLElBQUksR0FBSixHQUFVLEVBQVY7O0FBRUEsSUFBSSxJQUFKLEdBQVcsRUFBWDs7QUFFQSxJQUFJLElBQUosR0FBVyxFQUFYOztBQUVBLElBQUksR0FBSixHQUFVLEVBQVY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7SUFFUSxHLEdBQThCLEcsQ0FBOUIsRztJQUFLLEcsR0FBeUIsRyxDQUF6QixHO0lBQUssSSxHQUFvQixHLENBQXBCLEk7SUFBTSxJLEdBQWMsRyxDQUFkLEk7SUFBTSxHLEdBQVEsRyxDQUFSLEc7OztBQUU5QixLQUFLLGFBQUwsR0FBcUI7QUFDakIsUUFBSSxJQURhO0FBRWpCLFdBQU87QUFGVSxDQUFyQjs7QUFLQSxLQUFLLFdBQUwsR0FBbUI7QUFDZixZQUFRLEVBRE87QUFFZixZQUFRLEVBRk87QUFHZixXQUFPLEVBSFE7QUFJZixXQUFPLEVBSlE7QUFLZixZQUFRLEtBTE87QUFNZixZQUFRO0FBTk8sQ0FBbkI7O0FBU0EsS0FBSyxRQUFMLEdBQWdCO0FBQ1osWUFBUSxLQURJO0FBRVosZUFBVyxFQUZDO0FBR1osWUFBUSxFQUhJO0FBSVosV0FBTyxFQUpLO0FBS1osV0FBTyxFQUxLO0FBTVosYUFBUztBQU5HLENBQWhCOztBQVNBLEtBQUssS0FBTCxHQUFhO0FBQ1QsT0FBRyxDQURNO0FBRVQsUUFBSSxDQUZLO0FBR1QsU0FBSztBQUhJLENBQWI7O0FBTUEsS0FBSyxRQUFM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QixHQUFwQixDQUF3QixTQUF4QixFQUFtQyxNQUFuQztBQUNBLFVBQUUsV0FBRixFQUFlLEdBQWYsQ0FBbUIsU0FBbkIsRUFBOEIsTUFBOUI7QUFDSCxLQUhEO0FBSUEsUUFBSSxRQUFKO0FBQ0gsQ0FORDs7QUFRQSxFQUFFLFlBQVU7QUFDUixRQUFJLElBQUo7QUFDSCxDQUZELEUsQ0FFSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIERPTidUIEZPUkdFVCAhISEhISEhISEhIVxuLy8gZ2l0IHB1bGwgdXBzdHJlYW0gbWFzdGVyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBTVEFSVCBPRiBQU0VVRE9DT0RFIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFByb21wdCBmb3IgdXNlcidzIHBvc3RhbCBjb2RlLCBzdG9yZSBpbiB2YXJpYWJsZVxuLy8gTWFrZSBjYWxsIHRvIEdvb2dsZSBNYXBzIEFQSSBmb3IgbGF0IGFuZCBsb24sIHN0b3JlIGluIHZhcmlhYmxlc1xuLy8gU3RvcmUgdXNlciBjaG9pY2VzIGZvciBjdWlzaW5lIGFuZCBwcmljZSByYW5nZVxuLy8gTWFrZSBjYWxsIHRvIFpvbWF0byBmb3IgbmVhcmVzdCByZXN0YXVyYW50cyB1c2luZyBsYXQgYW5kIGxvblxuLy8gRmlsdGVyIHJlc3VsdHMgYnkgY3Vpc2luZSwgZGVsaXZlcnkgKGlmIGF2YWlsYWJsZSksIHByaWNlXG4vLyBDcmVhdGUgYW4gYXJyYXkgb2YgaWRzIGZvciBmaW5hbCBmb29kIHJlc3VsdHNcbi8vIFN0b3JlIHVzZXIgY2hvaWNlcyBmb3IgdHYgc2VyaWVzIG9yIG1vdmllIGFuZCBnZW5yZVxuLy8gTWFrZSBjYWxsIHRvIE1vdmllREIgZm9yIG1vc3QgcG9wdWxhciB0diBzaG93cyBvciBtb3ZpZXMgaW4gRW5nbGlzaCAoRGlzY292ZXIgZW5kcG9pbnQpXG4vLyBGaWx0ZXIgcmVzdWx0cyBieSBnZW5yZVxuLy8gQ3JlYXRlIGFuIGFycmF5IG9mIGlkcyBmb3IgZmluYWwgZW50ZXJ0YWlubWVudCByZXN1bHRzXG5cbi8vIFVzZSByYW5kb20gZnVuY3Rpb24gdG8gc2VsZWN0IDEgZnJvbSByZXN0YXVyYW50IGFycmF5IGFuZCBlbnRlcnRhaW5tZW50IGFycmF5XG4vLyBNYWtlIGNhbGwgdG8gWm9tYXRvIHJlc3RhdXJhbnQgZW5kcG9pbnQgYW5kIHN0b3JlIG5lY2Vzc2FyeSBpbmZvIGluIGFuIG9iamVjdFxuLy8gTWFrZSBjYWxsIHRvIE1vdmllREIgbW92aWUgb3IgdHYgc2hvdyBlbnBvaW50IGFuZCBzdG9yZSBuZWNlc3NhcnkgaW5mbyBpbiBhbiBvYmplY3Rcbi8vIERpc3BsYXkgdGl0bGUgYW5kIHBob3RvIGluIHNlcGFyYXRlIGRpdnMgZm9yIGVhY2ggc2lkZSBieSBzaWRlXG4vLyBMaXN0ZW4gZm9yIGNsaWNrIG9uIGRpdiwgdGhlbiBkaXNwbGF5IGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbi8vIExpc3RlbiBmb3IgY2xpY2sgb24gbG9jayB0byBzYXZlIGhhcHB5IHJlc3VsdCBhbmQgcmFuZG9taXplIGZvciBuZXcgcmVzdWx0IGZvciB1bmxvY2tlZCBkaXYgZm9yIG5ldyByZXN1bHRcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gRU5EIE9GIFBTRVVET0NPREUgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuY29uc3QgYXBwID0ge307XG5cbmFwcC56bXQgPSB7fTtcblxuYXBwLm1kYiA9IHt9O1xuXG5hcHAuZnNldCA9IFtdO1xuXG5hcHAucHJlZiA9IHt9O1xuXG5hcHAucmVzID0ge307XG5cbi8vIGFwcC5jYWxsID0ge1xuLy8gICAgIHJlc3RvOiAwLFxuLy8gICAgIHR2OiAwLFxuLy8gICAgIG1vdmllOiAwXG4vLyB9O1xuXG5jb25zdCB7IHptdCwgbWRiLCBmc2V0LCBwcmVmLCByZXMgfSA9IGFwcDtcblxuZnNldC5lbnRlcnRhaW5tZW50ID0ge1xuICAgIHR2OiAndHYnLFxuICAgIG1vdmllOiAnbW92aWVzJ1xufTtcblxuZnNldC5tb3ZpZUdlbnJlcyA9IHtcbiAgICBhY3Rpb246IDI4LFxuICAgIGNvbWVkeTogMzUsXG4gICAgY3JpbWU6IDgwLFxuICAgIGRyYW1hOiAxOCxcbiAgICBmYW1pbHk6IDEwNzUxLFxuICAgIGhvcnJvcjogMjcsXG59O1xuXG5mc2V0LnR2R2VucmVzID0ge1xuICAgIGFjdGlvbjogMTA3NTksXG4gICAgYW5pbWF0aW9uOiAxNixcbiAgICBjb21lZHk6IDM1LFxuICAgIGNyaW1lOiA4MCxcbiAgICBkcmFtYTogMTgsXG4gICAgcmVhbGl0eTogMTA3NjRcbn07XG5cbmZzZXQuY29zdHMgPSB7XG4gICAgJDogMSxcbiAgICAkJDogMixcbiAgICAkJCQ6IDNcbn07XG5cbmZzZXQuY3Vpc2luZXMgPSB7XG4gICAgY2FuYWRpYW46IDM4MSxcbiAgICBpdGFsaWFuOiA1NSxcbiAgICBqYXBhbmVzZTogNjAsXG4gICAgbWV4aWNhbjogNzMsXG4gICAgdGhhaTogOTUsXG4gICAgdmVnZXRhcmlhbjogMzA4XG59O1xuXG5jb25zdCB7IGVudGVydGFpbm1lbnQsIG1vdmllR2VucmVzLCB0dkdlbnJlcywgY29zdHMsIGN1aXNpbmVzIH0gPSBmc2V0XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBSRVVTQUJMRSBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5hcHAucmFuZG9tID0gKGFycikgPT4ge1xuICAgIGNvbnN0IGluZGV4ID0gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICByZXR1cm4gaW5kZXg7XG59O1xuXG4vLyBjb25zdHJ1Y3RzIGZpZWxkc2V0IG1hcmt1cCBpbiBmb3JtXG5hcHAuZnNldE1hcmt1cCA9IChvYmosIGNhdGVnb3J5KSA9PiB7XG4gICAgLy8gY3JlYXRlcyBhIGVtcHR5IGZpZWxkc2V0XG4gICAgY29uc3QgZmllbGRzZXQgPSAkKGA8ZmllbGRzZXQ+YCkuYWRkQ2xhc3MoY2F0ZWdvcnkpLmF0dHIoJ2lkJywgY2F0ZWdvcnkpXG4gICAgLy8gYXBwZW5kcyBmaWVsZHNldCB0byB0aGUgZm9ybVxuICAgICQoJ2Zvcm0nKS5wcmVwZW5kKGZpZWxkc2V0KTtcbiAgICAvLyBpdGVyYXRlcyB0aHJvdWdoIHRoZSBvYmplY3QgYW5kIGNyZWF0ZXMgYSByYWRpbyBpbnB1dCBmb3IgZWFjaCBrZXlcbiAgICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IGBcbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIGlkPVwiJHtrZXl9XCIgbmFtZT1cIiR7Y2F0ZWdvcnl9XCIgdmFsdWU9XCIke29ialtrZXldfVwiLz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCIke2tleX1cIj4ke2tleX08L2xhYmVsPlxuICAgICAgICAgIDwvZGl2PmBcbiAgICAgICAgICAvLyBhcHBlbmRzIHRoZSBvcHRpb24gKGlucHV0K2xhYmVsKSB0byB0aGUgZmllbGRzZXRcbiAgICAgICAgJChgLiR7Y2F0ZWdvcnl9YCkuYXBwZW5kKG9wdGlvbik7XG4gICAgfVxuICAgICQoJy50dkdlbnJlcycpLmFkZENsYXNzKCdyZW1vdmUnKTtcbiAgICAkKCcubW92aWVHZW5yZXMnKS5hZGRDbGFzcygncmVtb3ZlJyk7XG4gICAgJCgnLmNvc3RzJykuYWRkQ2xhc3MoJ3ByaWNlUmVtb3ZlJyk7XG59O1xuXG4vLyBjb25zdHJ1Y3RzIHJhdGluZyBkaXYgbWFya3VwIFxuYXBwLnJhdGluZ01hcmt1cCA9IChyYXRpbmcsIHR5cGUpID0+IHtcbiAgICBjb25zdCBudW0gPSBOdW1iZXIocmF0aW5nKTsgXG5cbiAgICAvLyByb3VuZHMgcmF0aW5nIHRvIG5lYXJlc3QgMC41XG4gICAgY29uc3Qgcm91bmRlZFJhdGluZyA9IE1hdGgucm91bmQobnVtICogMikgLyAyO1xuXG4gICAgLy8gY2hlY2tzIGlmIGhhbGYgcG9pbnQgZXhpc3RzXG4gICAgY29uc3QgaGFsZiA9IHJvdW5kZWRSYXRpbmcgJSAoTWF0aC5mbG9vcihyb3VuZGVkUmF0aW5nKSlcblxuICAgIGxldCByZXN0O1xuXG4gICAgaWYgKHR5cGUgPT09ICdyZXN0YXVyYW50Jykge1xuICAgICAgICByZXN0ID0gNSAtIE1hdGguY2VpbChyb3VuZGVkUmF0aW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN0ID0gMTAgLSBNYXRoLmNlaWwocm91bmRlZFJhdGluZyk7XG4gICAgfVxuXG4gICAgLy8gZGVjbGFyZXMgdmFyaWFibGUgd2hlcmUgZmluYWwgbWFya3VwIHdpbGwgYmUgc3RvcmVkXG4gICAgbGV0IGZpbmFsO1xuXG4gICAgY29uc3Qgc3RhciA9IGA8aSBjbGFzcz1cImZhcyBmYS1zdGFyXCI+PC9pPmA7XG4gICAgY29uc3QgaGFsZlN0YXIgPSBgPGkgY2xhc3M9XCJmYXMgZmEtc3Rhci1oYWxmLWFsdFwiPjwvaT5gXG4gICAgY29uc3QgZW1wdHkgPSBgPGkgY2xhc3M9XCJmYXIgZmEtc3RhclwiPjwvaT5gO1xuXG4gICAgLy8gaWYgcmVzdWx0IGluY2x1ZGVzIGhhbGYgcG9pbnQsIGFkZCBoYWxmIGEgc3RhclxuICAgIC8vIGlmIG5vdCwgdXNlIG9ubHkgd2hvbGUgc3RhcnNcbiAgICBpZiAobnVtID09PSAwKSB7XG4gICAgICAgIGZpbmFsID0gJ05vdCB5ZXQgcmF0ZWQnO1xuICAgIH0gZWxzZSBpZiAoaGFsZikge1xuICAgICAgICBmaW5hbCA9IHN0YXIucmVwZWF0KHJvdW5kZWRSYXRpbmcpICsgaGFsZlN0YXIgKyBlbXB0eS5yZXBlYXQocmVzdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmluYWwgPSBzdGFyLnJlcGVhdChyb3VuZGVkUmF0aW5nKSArIGVtcHR5LnJlcGVhdChyZXN0KTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm5zIGZpbmFsIG1hcmt1cFxuICAgIHJldHVybiBmaW5hbDtcbn1cblxuYXBwLm5ld1Jlc3RvT3B0aW9uID0gKCkgPT4ge1xuICAgICQoJy5jYWxsQWdhaW4ucmVzdGF1cmFudCcpLm9mZignY2xpY2snKTtcbiAgICAkKCcuY2FsbEFnYWluLnJlc3RhdXJhbnQnKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICQoJy5yZXN1bHQucmVzdGF1cmFudCcpLnJlbW92ZSgpO1xuICAgICAgICB6bXQucmVzdGF1cmFudENhbGwocHJlZi5jdWlzaW5lLCBwcmVmLnByaWNlKTtcbiAgICB9KTtcbn07XG5cbmFwcC5uZXdUdk9wdGlvbiA9ICgpID0+IHtcbiAgICAkKCcuY2FsbEFnYWluLnR2Jykub2ZmKCdjbGljaycpO1xuICAgICQoJy5jYWxsQWdhaW4udHYnKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICQoJy5yZXN1bHQudHYnKS5yZW1vdmUoKTtcbiAgICAgICAgbWRiLnR2Q2FsbChwcmVmLnR2R2VucmUpO1xuICAgIH0pO1xufTtcblxuYXBwLm5ld01vdmllT3B0aW9uID0gKCkgPT4ge1xuICAgICQoJy5jYWxsQWdhaW4ubW92aWUnKS5vZmYoJ2NsaWNrJyk7XG4gICAgJCgnLmNhbGxBZ2Fpbi5tb3ZpZScpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgJCgnLnJlc3VsdC5tb3ZpZScpLnJlbW92ZSgpO1xuICAgICAgICBtZGIubW92aWVDYWxsKHByZWYubW92aWVHZW5yZSk7XG4gICAgfSk7XG59O1xuXG5hcHAud2F0Y2hUcmFpbGVyID0gKCkgPT4ge1xuICAgICQoJy53YXRjaFRyYWlsZXInKS5vZmYoJ2NsaWNrJyk7XG4gICAgJCgnLndhdGNoVHJhaWxlcicpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgJCgnLnRyYWlsZXJQYWdlJykudG9nZ2xlQ2xhc3MoJ3Nob3cnKTtcbiAgICB9KTtcbn1cblxuYXBwLmNsb3NlVHJhaWxlciA9ICgpID0+IHtcbiAgICAkKCcuY2xvc2VUcmFpbGVyJykub2ZmKCdjbGljaycpO1xuICAgICQoJy5jbG9zZVRyYWlsZXInKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICQoJy50cmFpbGVyUGFnZScpLnRvZ2dsZUNsYXNzKCdzaG93Jyk7XG4gICAgfSk7XG59XG5cbi8vIGNvbnN0cnVjdHMgcmVzdWx0IGRpdiBtYXJrdXBcbmFwcC5yZXN1bHRNYXJrdXAgPSAob2JqKSA9PiB7XG5cbiAgICBsZXQgYmc7XG5cbiAgICBpZiAoIW9iai5iZykge1xuICAgICAgICBiZyA9IG9iai5iZzI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYmcgPSBvYmouYmdcbiAgICB9XG5cbiAgICAvLyBjcmVhdGVzIGNvbnRhaW5pbmcgZGl2IHdpdGggYmFja2dyb3VuZCBpbWFnZVxuICAgIGNvbnN0IHJlc3VsdENvbnRhaW5lciA9ICQoJzxkaXY+JykuYWRkQ2xhc3MoYHJlc3VsdCAke29iai50eXBlfWApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsIGB1cmwoJyR7Ymd9JylgKTtcblxuICAgIC8vIGFwcGVuZHMgZW1wdHkgcmVzdWx0IGNvbnRhaW5lciB0byBib2R5IGNvbnRhaW5lclxuICAgICQoJy5yZXN1bHRzUGFnZScpLmFwcGVuZChyZXN1bHRDb250YWluZXIpO1xuICAgIFxuICAgIC8vIGNyZWF0ZXMgcmF0aW5nIG1hcmt1cFxuICAgIGNvbnN0IHJhdGluZ01hcmt1cCA9IGFwcC5yYXRpbmdNYXJrdXAob2JqLnJhdGluZywgb2JqLnR5cGUpO1xuICAgIFxuICAgIC8vIGNyZWF0ZXMgdGV4dCB3aXRoIHRpdGxlLCBkZXRhaWwsIHJhdGluZ1xuICAgIFxuY29uc3QgcmVzdWx0ID0gYDxkaXYgY2xhc3M9XCJ0ZXh0ICR7b2JqLnR5cGV9XCI+XG4gICAgICAgIDxhIGhyZWY9XCIke29iai51cmx9XCI+PGgzPiR7b2JqLmgzfTwvaDM+PC9hPlxuICAgICAgICA8cD4ke29iai5wfTwvcD5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwicmF0aW5nICR7b2JqLnR5cGV9XCI+JHtyYXRpbmdNYXJrdXB9PC9kaXY+XG4gICAgPGJ1dHRvbiBjbGFzcz1cImNhbGxBZ2FpbiAke29iai50eXBlfVwiPkdpbW1lIGFub3RoZXI8L2J1dHRvbj5gO1xuICAgIFxuICAgIC8vIGFwcGVuZHMgZmluYWwgcmVzdWx0IG1hcmt1cCB0byByZXN1bHQgY29udGFpbmVyXG4gICAgJChgLiR7b2JqLnR5cGV9YCkuYXBwZW5kKHJlc3VsdCk7XG5cbiAgICBjb25zdCB0cmFpbGVyID0gbWRiLnRyYWlsZXJDYWxsKG9iai50eXBlLCBvYmouaWQpO1xuXG4gICAgaWYgKHRyYWlsZXIpIHtcbiAgICAgICAgaWYgKG9iai50eXBlID09PSBcInR2XCIgfHwgb2JqLnR5cGUgPT09IFwibW92aWVcIikge1xuICAgICAgICAgICAgY29uc3Qgd2F0Y2hUcmFpbGVyID0gYDxidXR0b24gY2xhc3M9XCJ3YXRjaFRyYWlsZXJcIj5UcmFpbGVyPC9idXR0b24+YDtcbiAgICAgICAgICAgICQoYC50ZXh0LiR7b2JqLnR5cGV9YCkuYXBwZW5kKHdhdGNoVHJhaWxlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhcHAubmV3UmVzdG9PcHRpb24oKTtcbiAgICBhcHAubmV3VHZPcHRpb24oKTtcbiAgICBhcHAubmV3TW92aWVPcHRpb24oKTtcbiAgICBhcHAud2F0Y2hUcmFpbGVyKCk7XG4gICAgYXBwLmNsb3NlVHJhaWxlcigpO1xufTtcblxuXG5hcHAudHJhaWxlck1hcmt1cCA9IChrZXkpID0+IHtcbiAgICAkKCcudHJhaWxlcicpLnJlbW92ZSgpO1xuICAgIGlmKGtleSA9PT0gMCkge1xuICAgICAgICBjb25zdCBzb3JyeSA9IGA8cCBjbGFzcz1cInRyYWlsZXJcIj5Tb3JyeSwgbm8gdHJhaWxlciBhdmFpbGFibGUhPC9wPmBcbiAgICAgICAgJCgnLnRyYWlsZXJQYWdlJykuYXBwZW5kKHNvcnJ5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlbWJlZCA9IGA8aWZyYW1lIGNsYXNzPVwidHJhaWxlclwiIHdpZHRoPVwiNTYwXCIgaGVpZ2h0PVwiMzE1XCIgc3JjPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJHtrZXl9XCIgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3c9XCJhdXRvcGxheTsgZW5jcnlwdGVkLW1lZGlhXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPmA7XG4gICAgICAgICQoJy50cmFpbGVyUGFnZScpLmFwcGVuZChlbWJlZCk7XG4gICAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFpPTUFUTyBTSElaIC8vXG4vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBab21hdG8gQVBJIGRhdGFcbnptdC5rZXkgPSAnMmM0NGZkOWZlMTk4ZTViZTgzY2NjYmRmYWI4NjY1ZjUnXG56bXQudXJsID0gJ2h0dHBzOi8vZGV2ZWxvcGVycy56b21hdG8uY29tL2FwaS92Mi4xLydcblxuLy8gYWpheCByZXF1ZXN0IHRvIFpvbWF0byBzZWFyY2ggZW5kcG9pbnRcbnptdC5yZXN0YXVyYW50Q2FsbCA9IChjdWlzaW5lLCBwcmljZSwgc3RhcnQgPSAwKSA9PiAkLmFqYXgoe1xuICAgIHVybDogYCR7em10LnVybH1zZWFyY2hgLFxuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBkYXRhOiB7XG4gICAgICAgIGFwaWtleTogem10LmtleSxcbiAgICAgICAgZW50aXR5X2lkOiA4OSxcbiAgICAgICAgZW50aXR5X3R5cGU6ICdjaXR5JyxcbiAgICAgICAgcTogJ1Rvcm9udG8nLFxuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIGN1aXNpbmVzOiBjdWlzaW5lLFxuICAgICAgICBjYXRlZ29yeTogMSxcbiAgICAgICAgc29ydDogJ3JhdGluZycsXG4gICAgICAgIG9yZGVyOiAnZGVzYydcbiAgICB9XG59KVxuLnRoZW4oKHJlcykgPT4geyAgICAgICAgLy8gcmV0dXJucyByZXN0YXVyYW50cyBpbiBUb3JvbnRvIGJ5IGN1aXNpbmUgY2hvaWNlXG4gICAgLy8gZmlsdGVycyByZXNwb25zZSBieSBwcmljZSBjaG9pY2VcbiAgICBjb25zdCByZXN0b0xpc3RieVByaWNlID0gcmVzLnJlc3RhdXJhbnRzLmZpbHRlcigocmVzdG8pID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc3RvLnJlc3RhdXJhbnQucHJpY2VfcmFuZ2UgPT09IE51bWJlcihwcmljZSk7XG4gICAgfSk7XG5cbiAgICAvLyByYW5kb21seSBzZWxlY3RzIG9uZSByZXN0YXVyYW50IGZyb20gY2FsbFxuICAgIGNvbnN0IHJhbmRvbVJlc3RvID0gYXBwLnJhbmRvbShyZXN0b0xpc3RieVByaWNlKTtcbiAgICBjb25zdCByZXN0b1RvUHJpbnQgPSByYW5kb21SZXN0by5yZXN0YXVyYW50O1xuICAgIFxuICAgIGxldCBjdWlzaW5lS2V5O1xuICAgIFxuICAgIGZvciAobGV0IGtleSBpbiBmc2V0LmN1aXNpbmVzKSB7XG4gICAgICAgIGlmIChmc2V0LmN1aXNpbmVzW2tleV0gPT09IE51bWJlcihjdWlzaW5lKSkge1xuICAgICAgICAgICAgY3Vpc2luZUtleSA9IGtleTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLy8gb2JqZWN0IHdpdGggYWRkcmVzcywgdXNlciByYXRpbmcsIHBob3RvIHVybCwgem9tYXRvIGxpbmtcbiAgICBjb25zdCByZXN0YXVyYW50ID0ge1xuICAgICAgICB0eXBlOiAncmVzdGF1cmFudCcsXG4gICAgICAgIGgzOiByZXN0b1RvUHJpbnQubmFtZSxcbiAgICAgICAgcDogcmVzdG9Ub1ByaW50LmxvY2F0aW9uLmFkZHJlc3MsXG4gICAgICAgIHJhdGluZzogcmVzdG9Ub1ByaW50LnVzZXJfcmF0aW5nLmFnZ3JlZ2F0ZV9yYXRpbmcsXG4gICAgICAgIGJnOiByZXN0b1RvUHJpbnQuZmVhdHVyZWRfaW1hZ2UsXG4gICAgICAgIGJnMjogYC4uLy4uL2Fzc2V0cy8ke2N1aXNpbmVLZXl9LmpwZ2AsXG4gICAgICAgIHVybDogcmVzdG9Ub1ByaW50LnVybFxuICAgIH1cbiAgICBcbiAgICBhcHAucmVzdWx0TWFya3VwKHJlc3RhdXJhbnQpO1xuXG59KTsgLy8qIEVORCBPRiBaT01BVE8gVEhFTiBTVEFURU1FTlQgKi8vXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBNT1ZJRURCIEpVTksgLy9cbi8vLy8vLy8vLy8vLy8vLy8vL1xuXG5tZGIua2V5ID0gJzJiMDNiMWFkMTRiNTY2NGEyMTE2MWRiMmFjZGUzYWI1Jztcbm1kYi51cmwgPSAnaHR0cHM6Ly9hcGkudGhlbW92aWVkYi5vcmcvMy8nO1xubWRiLmltZ0Jhc2VVcmwgPSAnaHR0cHM6Ly9pbWFnZS50bWRiLm9yZy90L3Avb3JpZ2luYWwvJztcbm1kYi50cmFpbGVyQmFzZVVybCA9ICdodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PSc7XG5cbm1kYi50cmFpbGVyQ2FsbCA9ICh0eXBlLCBpZCkgPT4gJC5hamF4KHtcbiAgICB1cmw6IGAke21kYi51cmx9JHt0eXBlfS8ke2lkfS92aWRlb3NgLFxuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBkYXRhOiB7XG4gICAgICAgIGFwaV9rZXk6IG1kYi5rZXlcblxuICAgIH1cbn0pLnRoZW4oKHJlcykgPT4ge1xuXG4gICAgLy8gZmlsdGVycyByZXNwb25zZSBieSBhdmFpbGFiaWxpdHkgb24gWW91VHViZVxuICAgIGNvbnN0IHRyYWlsZXJMaXN0ID0gcmVzLnJlc3VsdHMuZmlsdGVyKCh0cmFpbGVyKSA9PiB7XG4gICAgICAgIHJldHVybiB0cmFpbGVyLnNpdGUgPT09IFwiWW91VHViZVwiICYmIHRyYWlsZXIudHlwZSA9PT0gXCJUcmFpbGVyXCI7XG4gICAgfSk7XG5cbiAgICBpZiAoIXRyYWlsZXJMaXN0WzBdKSB7XG4gICAgICAgIGFwcC50cmFpbGVyTWFya3VwKDApXG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdHJhaWxlcktleSA9IHRyYWlsZXJMaXN0WzBdLmtleVxuICAgICAgICBhcHAudHJhaWxlck1hcmt1cCh0cmFpbGVyS2V5KTtcbiAgICB9XG59KTtcblxuLy8vLyBpZiB1c2VyIGNob29zZXMgdHYgLy8vLy8vLy8vLy8vLy8vL1xuXG5tZGIudHZDYWxsID0gKGdlbnJlLCBwYWdlID0gMSkgPT4gJC5hamF4KHtcbiAgICB1cmw6IGAke21kYi51cmx9ZGlzY292ZXIvdHZgLFxuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBkYXRhOiB7XG4gICAgICAgIGFwaV9rZXk6IG1kYi5rZXksXG4gICAgICAgIHNvcnRfYnk6ICdwb3B1bGFyaXR5LmRlc2MnLFxuICAgICAgICB3aXRoX29yaWdpbmFsX2xhbmd1YWdlOiAnZW4nLFxuICAgICAgICBwYWdlOiBwYWdlLFxuICAgICAgICB3aXRoX2dlbnJlczogZ2VucmUsXG4gICAgICAgIGdlbnJlX2lkczogZ2VucmVcbiAgICB9XG59KVxuLnRoZW4oKHJlcykgPT4geyAvLyByZXR1cm5zIHR2IHNlcmllcyBieSBnZW5yZSBjaG9pY2VcbiAgICAvLyBuYXJyb3dzIGRvd24gcmVzcG9uc2UgdG8gcmVzdWx0cyBrZXlcbiAgICBjb25zdCB0dkxpc3RCeUdlbnJlID0gcmVzLnJlc3VsdHM7XG4gICAgY29uc29sZS5sb2codHZMaXN0QnlHZW5yZSk7XG4gICAgLy8gcmFuZG9tbHkgc2VsZWN0cyBvbmUgc2hvdyBmcm9tIGNhbGxcbiAgICBjb25zdCBzaG93VG9QcmludCA9IGFwcC5yYW5kb20odHZMaXN0QnlHZW5yZSk7XG4gICAgXG4gICAgLy8gY2hvb3NlcyBhIHJhbmRvbSB0diBzaG93IGZyb20gdGhlIGdlbnJlIGxpc3RcbiAgICBjb25zdCB0dlNob3cgPSB7XG4gICAgICAgIGlkOiBzaG93VG9QcmludC5pZCxcbiAgICAgICAgdHlwZTogJ3R2JyxcbiAgICAgICAgaDM6IHNob3dUb1ByaW50Lm5hbWUsXG4gICAgICAgIHA6IHNob3dUb1ByaW50Lm92ZXJ2aWV3LFxuICAgICAgICByYXRpbmc6IHNob3dUb1ByaW50LnZvdGVfYXZlcmFnZSxcbiAgICAgICAgYmc6IG1kYi5pbWdCYXNlVXJsICsgc2hvd1RvUHJpbnQuYmFja2Ryb3BfcGF0aCxcbiAgICAgICAgYmcyOiBtZGIuaW1nQmFzZVVybCArIHNob3dUb1ByaW50LnBvc3Rlcl9wYXRoLFxuICAgICAgICB1cmw6IGBodHRwczovL3d3dy50aGVtb3ZpZWRiLm9yZy90di8ke3Nob3dUb1ByaW50LmlkfWBcbiAgICB9O1xuXG4gICAgYXBwLnJlc3VsdE1hcmt1cCh0dlNob3cpO1xufSk7XG5cbi8vLy8gaWYgdXNlciBjaG9vc2VzIG1vdmllcyAvLy8vLy8vLy8vLy8vLy8vXG5cbm1kYi5tb3ZpZUNhbGwgPSAoZ2VucmUsIHBhZ2UgPSAxKSA9PiAkLmFqYXgoe1xuICAgIHVybDogYCR7bWRiLnVybH1kaXNjb3Zlci9tb3ZpZWAsXG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGRhdGE6IHtcbiAgICAgICAgYXBpX2tleTogbWRiLmtleSxcbiAgICAgICAgc29ydF9ieTogJ3BvcHVsYXJpdHkuZGVzYycsXG4gICAgICAgIHdpdGhfb3JpZ2luYWxfbGFuZ3VhZ2U6ICdlbicsXG4gICAgICAgIHBhZ2U6IHBhZ2UsXG4gICAgICAgIHdpdGhfZ2VucmVzOiBnZW5yZVxuICAgIH1cbn0pLnRoZW4oKHJlcykgPT4ge1xuICAgIC8vIG5hcnJvd3MgZG93biByZXNwb25zZSB0byByZXN1bHRzIGtleVxuICAgIGNvbnN0IG1vdmllTGlzdEJ5R2VucmUgPSByZXMucmVzdWx0cztcblxuICAgIC8vIHJhbmRvbWx5IHNlbGVjdHMgb25lIG1vdmllIGZyb20gY2FsbFxuICAgIGNvbnN0IG1vdmllVG9QcmludCA9IGFwcC5yYW5kb20obW92aWVMaXN0QnlHZW5yZSk7XG5cbiAgICBjb25zdCBtb3ZpZSA9IHtcbiAgICAgICAgaWQ6IG1vdmllVG9QcmludC5pZCxcbiAgICAgICAgdHlwZTogJ21vdmllJyxcbiAgICAgICAgaDM6IG1vdmllVG9QcmludC50aXRsZSxcbiAgICAgICAgcDogbW92aWVUb1ByaW50Lm92ZXJ2aWV3LFxuICAgICAgICByYXRpbmc6IG1vdmllVG9QcmludC52b3RlX2F2ZXJhZ2UsXG4gICAgICAgIGJnOiBtZGIuaW1nQmFzZVVybCttb3ZpZVRvUHJpbnQuYmFja2Ryb3BfcGF0aCxcbiAgICAgICAgYmcyOiBtZGIuaW1nQmFzZVVybCttb3ZpZVRvUHJpbnQucG9zdGVyX3BhdGgsXG4gICAgICAgIHVybDogYGh0dHBzOi8vd3d3LnRoZW1vdmllZGIub3JnL21vdmllLyR7bW92aWVUb1ByaW50LmlkfWBcbiAgICB9XG5cbiAgICBhcHAucmVzdWx0TWFya3VwKG1vdmllKTtcbn0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLyBET0NVTUVOVCBSRUFEWSAvLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbmFwcC5wb3B1bGF0ZU5leHQgPSAoaWQsIG9iaiwgdHlwZSwgcmVtb3ZlKSA9PiB7XG4gICAgJCgnZm9ybScpLm9uKCdjbGljaycsIGlkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQocmVtb3ZlKS5yZW1vdmUoKTtcbiAgICAgICAgYXBwLmZzZXRNYXJrdXAob2JqLCB0eXBlKTtcbiAgICB9KTtcbn1cblxuXG4vLyBTVUJNSVQgRk9STSBGVU5DVElPTlxuYXBwLnN1Ym1pdCA9ICgpID0+IHtcbiAgICAkKCdmb3JtJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcHJlZi5lbnRlcnRhaW5tZW50ID0gJCgnaW5wdXRbbmFtZT1lbnRlcnRhaW5tZW50XTpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIHByZWYudHZHZW5yZSA9ICQoJ2lucHV0W25hbWU9dHZHZW5yZXNdOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICAgcHJlZi5tb3ZpZUdlbnJlID0gJCgnaW5wdXRbbmFtZT1tb3ZpZUdlbnJlc106Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgICBwcmVmLmN1aXNpbmUgPSAkKCdpbnB1dFtuYW1lPWN1aXNpbmVzXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIHByZWYucHJpY2UgPSAkKCdpbnB1dFtuYW1lPWNvc3RzXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHByZWYpO1xuICAgICAgICB6bXQucmVzdGF1cmFudENhbGwocHJlZi5jdWlzaW5lLCBwcmVmLnByaWNlKTtcbiAgICAgICAgaWYocHJlZi50dkdlbnJlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1kYi5tb3ZpZUNhbGwocHJlZi5tb3ZpZUdlbnJlKTtcbiAgICAgICAgfSBlbHNlIGlmKHByZWYubW92aWVHZW5yZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBtZGIudHZDYWxsKHByZWYudHZHZW5yZSk7XG4gICAgICAgIH0gIFxuICAgICAgICAkKCcuZm9ybVBhZ2UnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICAkKCcucmVzdWx0c1BhZ2UnKS5jc3MoJ2Rpc3BsYXknLCAnZ3JpZCcpO1xuICAgIH0pOyBcbn1cblxuXG5hcHAuZm9ybUluaXQgPSAoKSA9PiB7XG4gICAgYXBwLmZzZXRNYXJrdXAoZW50ZXJ0YWlubWVudCwgXCJlbnRlcnRhaW5tZW50XCIpO1xuICAgIGFwcC5mc2V0TWFya3VwKGN1aXNpbmVzLCBcImN1aXNpbmVzXCIpO1xuICAgIGFwcC5wb3B1bGF0ZU5leHQoJyN0dicsIHR2R2VucmVzLCBcInR2R2VucmVzXCIsIFwiLnJlbW92ZVwiKTtcbiAgICBhcHAucG9wdWxhdGVOZXh0KCcjbW92aWUnLCBtb3ZpZUdlbnJlcywgXCJtb3ZpZUdlbnJlc1wiLCBcIi5yZW1vdmVcIik7XG4gICAgZm9yKGxldCBjdWlzaW5lIGluIGN1aXNpbmVzKSB7XG4gICAgICAgIGFwcC5wb3B1bGF0ZU5leHQoYCMke2N1aXNpbmV9YCwgY29zdHMsIFwiY29zdHNcIiwgXCIucHJpY2VSZW1vdmVcIik7XG4gICAgfVxuICAgIGFwcC5zdWJtaXQoKTtcbn1cblxuYXBwLmluaXQgPSAoKSA9PiB7XG4gICAgJCgnYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnLm1haW5TdGFydFBhZ2UnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICAkKCcuZm9ybVBhZ2UnKS5jc3MoJ2Rpc3BsYXknLCAnZ3JpZCcpO1xuICAgIH0pO1xuICAgIGFwcC5mb3JtSW5pdCgpO1xufVxuXG4kKGZ1bmN0aW9uKCl7XG4gICAgYXBwLmluaXQoKTtcbn0pOyAvLyBFTkQgT0YgRE9DVU1FTlQgUkVBRFlcbiJdfQ==
