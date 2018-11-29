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

// Initialize Firebase
var config = {
    apiKey: "AIzaSyC88VWTxZ8bT_lApnGOVR-Rr2zuNSY-qss",
    authDomain: "bootcamp-a18e5.firebaseapp.com",
    databaseURL: "https://bootcamp-a18e5.firebaseio.com",
    projectId: "bootcamp-a18e5",
    storageBucket: "bootcamp-a18e5.appspot.com",
    messagingSenderId: "995593097318"
};

firebase.initializeApp(config);

var database = firebase.database();

// Bandsintown App ID
var BIT_Id = "6d9b15f09f67304fbd702249a8b58714";

// Array of Data Returned from Spotify
var spotifyArray = [];

// Ticket click variable
var countTrack = 0;

$(document).ready(function () {
    var URL = document.URL;

    // If Statement to check if user has not logged in to spotify (condition: access token not in url string)
    if ((URL).indexOf("access_token") === -1) {

        // Main Page Hidden
        $("#main-page").css("display", "none");

        // Click Event For Login
        $('.spotify-link').on('click', function () {
            $('.spotify-link').attr('href', 'https://accounts.spotify.com/en/authorize?response_type=token&client_id=ca5834e480c6461fba72bb35632ecead&redirect_uri=https:%2F%2Ftzlomke.github.io%2FProject_1%2F&scope=user-top-read%20user-library-read&state=123');
        });

        // Else statement (condition: access token in string). Main page functionality will occur within
    } else {

        // Landing Page Hidden
        $("#landing-page").css("display", "none");

        // Split URL multiple times so that only the characters of the token are returned in the end. (Spotify will only allow access to user profile if token is passed in as a "header" in AJAX call, see below).
        // (There's probably a DRYer way to do this, but this worked for now)
        var tokenArray = URL.split("#");
        var splitTokenArray = tokenArray[1].split("&");
        var finalTokenArray = splitTokenArray[0].split("=");
        var client_token = finalTokenArray[1];

        // Spotify AJAX call
        function spotifyAPICall() {
            var queryURL = "https://api.spotify.com/v1/me/top/artists";
            $.ajax({
                url: queryURL,
                method: "GET",
                // Auth Token Passed to Spotify Here
                headers: {
                    "Authorization": "Bearer " + client_token
                }
            }).then(function (response) {
                var results = response.items;
                // For loop to push user favorite artist names, IDs and images into arrays
                for (var i = 0; i < results.length; i++) {
                    spotifyArray.push({
                        artistName: results[i].name,
                        spotifyID: results[i].id,
                    });
                };

                $("iframe").attr("src", "https://open.spotify.com/embed/artist/" + spotifyArray[0].spotifyID);

                // Calls Bandsintown for Top Artist Returned From Spotify
                $.ajax({
                    url: "https://rest.bandsintown.com/artists/" + spotifyArray[0].artistName + "/events?app_id=" + BIT_Id,
                    method: "GET"
                }).then(function (response) {
                    // Event Table Creation for Top Artist Ordered with In-State Events First
                    var inRegionObjectArray = [];
                    var outRegionObjectArray = [];
                    for(var i = 0; i < response.length; i++) {
                        var venue_name = response[i].venue.name;
                        var venue_city = response[i].venue.city;
                        var venue_country = response[i].venue.country;
                        var venue_date = moment(response[i].datetime).format('dddd, MMMM Do YYYY');
                        var ticketLink = response[i].offers[0].url;
                        var venue_region = response[i].venue.region;
                        if(venue_region === region_up) {
                            inRegionObjectArray.push( {
                                name: venue_name,
                                city: venue_city,
                                country: venue_country,
                                date: venue_date,
                                ticket: ticketLink,
                            });
                        } else {
                            outRegionObjectArray.push( {
                                name: venue_name,
                                city: venue_city,
                                country: venue_country,
                                date: venue_date,
                                ticket: ticketLink,
                            });
                        };
                    };
                    if(inRegionObjectArray[0] !== -1) {
                        for(var i = 0; i < inRegionObjectArray.length; i++) {
                            $("#event-table").append("<tr class='event-data'>" +
                            "<td class='venue'>" + inRegionObjectArray[i].name + "</td>" +
                            "<td class='city'>" + inRegionObjectArray[i].city + "</td>" +
                            "<td class='country'>" + inRegionObjectArray[i].country + "</td>" +
                            "<td class='date'>" + inRegionObjectArray[i].date + "</td>" +
                            "<td class='ticket-link'><a class='button' href=" + inRegionObjectArray[i].ticket + ">Get Tickets</a></td>" +
                            "</tr>"
                            );
                        };
                    };
                    if(outRegionObjectArray[0] !== -1) {
                        for(var i = 0; i < outRegionObjectArray.length; i++) {
                            $("#event-table").append("<tr class='event-data'>" +
                            "<td class='venue'>" + outRegionObjectArray[i].name + "</td>" +
                            "<td class='city'>" + outRegionObjectArray[i].city + "</td>" +
                            "<td class='country'>" + outRegionObjectArray[i].country + "</td>" +
                            "<td class='date'>" + outRegionObjectArray[i].date + "</td>" +
                            "<td class='ticket-link'><a class='button' href=" + outRegionObjectArray[i].ticket + ">Get Tickets</a></td>" +
                            "</tr>"
                            );
                        };
                    };
                });

                
                console.log(spotifyArray);

                // Artist Table Creation
                for (var i = 0; i < spotifyArray.length; i++) {
                    $("#artist-table").append("<tr class='artist-name' id=" +
                        spotifyArray[i].spotifyID + "><td>" +
                        spotifyArray[i].artistName + "</td></tr>");
                };
            });
        };

        // Run Spotify API call function
        spotifyAPICall();



        // Click Events for Artist Table Rows
        $(document).on("click", "#artist-table tr.artist-name", function () {
            
            var queryURL2 = "https://rest.bandsintown.com/artists/" + this.textContent + "/events?app_id=" + BIT_Id;

            // Pass Selected Artist to Spotify Player
            $("iframe").attr("src", "https://open.spotify.com/embed/artist/" + this.id);
            
            // Clears Out Old Table
            $("#event-table .event-data").remove();

            // New Bandsintown AJAX Call
            $.ajax({
                url: queryURL2,
                method: "GET"
            }).then(function (response) {
                // New Event Table Creation
                for (var i = 0; i < response.length; i++) {
                    $("#event-table").append("<tr class='event-data'>" +
                        "<td class='event-data venue'>" + response[i].venue.name + "</td>" +
                        "<td class='event-data city'>" + response[i].venue.city + "</td>" +
                        "<td class='event-data country'>" + response[i].venue.country + "</td>" +
                        "<td class='event-data date'>" + moment(response[i].datetime).format("dddd, MMMM Do YYYY") + "</td>" +
                        "<td class='event-data ticket-link'><a class='button ticket-click' href=" + response[i].offers[0].url + ">Get Tickets</a></td>" +
                        "</tr>"
                    );
                };
            });
        });
        document.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(e.target.className);
            if(e.target.className === 'button ticket-click') {
                database.ref('Gigify/tickclick/').once('value', function(snapshot) {
                    countTrack = snapshot.val().count;
                    ++countTrack;
                    database.ref('Gigify/tickclick/').update({
                        count: countTrack,
                    });
                });
            };
        });
    };
});





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