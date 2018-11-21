
// Input function ()
    // search form
        // input field for searching artist names- store input as variable
        // submit button - click event
            // input validation with modal - if/else

// make ajax calls
    // bands in town - push object data into arrays for later for loop
    // spotify -push object data into widget

// else    //  Output function ()
    // clear previous data
    // for loop {}  to create output table for results from bands in town
        // filter down by date
        // include link to purchase tickets

    // push artist id into spotify widget


// band, date, venue, ticket

// Query AJAX for artist ID AJAX query to spotify using 'search'
// Utilize artist ID for widget

// Pull token from URL and pass into AJAX call
$(document).ready(function() {
    let artistRequested = 'Ivan Torrent';
    let URL = document.URL;

        $('.spotify-link').on('click', function() {
            $('.spotify-link').attr('href', 'https://accounts.spotify.com/en/authorize?response_type=token&client_id=ca5834e480c6461fba72bb35632ecead&redirect_uri=https:%2F%2Ftzlomke.github.io%2FProject_1%2F&scope=user-top-read%20user-library-read&state=123');
        });
    
    $('.API_test').on('click', function() {
        let tokenArray = URL.split('#');
        let client_token = tokenArray[1];
    // function spotifyAPICall() {
        console.log("Hey!");
        let queryURL = `https://api.spotify.com/v1/search?q=${artistRequested}&type=artist&${client_token}`;
        $.ajax ({
            url : queryURL,
            method: 'GET',
        }).then(function(response) {
            console.log(response);
        });
    // };

    $('.API_test').on('click', function() {
        let artistRequested = $('#search').val();
        console.log(artistRequested);
        let BITURL = `https://rest.bandsintown.com/artists/${artistRequested}/events?app_id=`
        let BIT_Id = '6d9b15f09f67304fbd702249a8b58714';
        $.ajax ({
            url : BITURL + BIT_Id,
            method: 'GET',
        }).then(function(response) {
            console.log(response);
        });
    });
});
});
