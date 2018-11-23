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

$(document).ready(function () {
    var URL = document.URL;

    // Spotify Arrays
    // Artist Names
    var favoriteArtists = [];
    // IDs to use in embeded Spotify player
    var spotifyID = [];
    // Images to use on page
    var artistImage = [];

    // Bandsintown Variables and Arrays
    var BIT_Id = "6d9b15f09f67304fbd702249a8b58714";
    var BITObjectArray = []


    // Search Function if user makes a direct search
    $("#search").on("click", function() {
        event.preventDefault();
        var userInput = $("#userInput").val().trim().toString();
        console.log(userInput);


    // Validating that the input field is not empty
        if (userInput === "") {
            // Calling modal
            $("#emptyOpenModal").addClass("is-active");
            // Closing modal
            $("#emptyCloseModal").click(function() {
            $("#emptyOpenModal").removeClass("is-active");
            });

    // searching bands in town using input to return either a table or an error modal
        } else {
            $("#userInput").append(userInput)
            // search bands in town and populate table
            // if (userInput does not match any artist name) 
            // {create another modal communicating invalid artist}
        }

    });


    // If Statement to check if user has not logged in to spotify (condition: access token not in url string)
    if ((URL).indexOf("access_token") === -1) {

        // Main page hidden
        $("#main-page").css("display", "none");

        // Click event for log in
        $('.spotify-link').on('click', function () {
            $('.spotify-link').attr('href', 'https://accounts.spotify.com/en/authorize?response_type=token&client_id=5337c5eb0a2442b182b404f5a590b917&redirect_uri=https:%2F%2Ftzlomke.github.io%2Fgigify_test%2F&scope=user-top-read%20user-library-read&state=123');
        })

    // Else statement (condition: access token in string). Main page functionality will occur within
    } else {

        // Landing page hidden
        $("#landing-page").css("display", "none");

        
        // Split URL multiple times so that only the characters of the token are returned in the end. (Spotify will only allow access to user profile if token is passed in as a "header" in AJAX call, see below).
        // (There's probably a DRYer way to do this, but this is what I came up with)
        var tokenArray = URL.split("#");
        var splitTokenArray = tokenArray[1].split("&");
        console.log(splitTokenArray);
        finalTokenArray = splitTokenArray[0].split("=");
        console.log(finalTokenArray);
        var client_token = finalTokenArray[1];
        console.log(client_token);


        // Spotify AJAX call
        function spotifyAPICall() {
            var queryURL = "https://api.spotify.com/v1/me/top/artists";
            console.log(queryURL);
            $.ajax({
                url: queryURL,
                method: "GET",
                // Auth token passed to Spotify here
                headers: {
                    "Authorization": "Bearer " + client_token
                }
            }).then (function (response){
                console.log(response);
                var results = response.items;
                console.log(results)
                // For loop to push user favorite artist names, IDs and images into arrays
                for (var i = 0; i < results.length; i++) {
                    favoriteArtists.push(results[i].name);
                    spotifyID.push(results[i].id);
                    artistImage.push(results[i].images[2]);
                }
                console.log(favoriteArtists);
                console.log(spotifyID);
                console.log(artistImage);

                // For loop to pass favoriteArtists array as query to Bandsintown API
                for (var i = 0; i < favoriteArtists.length; i++) {
                    var BITURL = "https://rest.bandsintown.com/artists/" + favoriteArtists[i] + "/events?app_id=" + BIT_Id;
                    $.ajax({
                        url: BITURL,
                        method: "GET"
                    }).then(function (response) {
                        console.log(response);
                        var name = favoriteArtists[i];
                        // Sets each response as element of BITObjectArray (an array of JSON-style objects) so that we can pull this data to populate our page
                        BITObjectArray.push({
                            artistName: name,
                            eventData: response
                        })
                    })
                    console.log(BITObjectArray);
                }
            })
        };

        // Run Spotify API call function
        spotifyAPICall();
    }
})



// AJAX Calls from prior testing with click function
// Pull token from URL and pass into AJAX call
// $(document).ready(function () {
    // let artistRequested = 'Ivan Torrent';
    // let URL = document.URL;

    // $('.spotify-link').on('click', function () {
    //     $('.spotify-link').attr('href', 'https://accounts.spotify.com/en/authorize?response_type=token&client_id=ca5834e480c6461fba72bb35632ecead&redirect_uri=https:%2F%2Ftzlomke.github.io%2FProject_1%2F&scope=user-top-read%20user-library-read&state=123');
    // });

    // $('.API_test').on('click', function () {
    //     let tokenArray = URL.split('#');
    //     let client_token = tokenArray[1];
    //     // function spotifyAPICall() {
    //     console.log("Hey!");
    //     let queryURL = `https://api.spotify.com/v1/search?q=${artistRequested}&type=artist&${client_token}`;
    //     $.ajax({
    //         url: queryURL,
    //         method: 'GET',
    //     }).then(function (response) {
    //         console.log(response);
    //     });
    //     // };

    //     $('.API_test').on('click', function () {
    //         let artistRequested = $('#search').val();
    //         console.log(artistRequested);
    //         let BITURL = `https://rest.bandsintown.com/artists/${artistRequested}/events?app_id=`
    //         let BIT_Id = '6d9b15f09f67304fbd702249a8b58714';
    //         $.ajax({
    //             url: BITURL + BIT_Id,
    //             method: 'GET',
    //         }).then(function (response) {
    //             console.log(response);
    //         });
    //     });
    // });
// });