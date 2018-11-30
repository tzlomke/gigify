// Bandsintown App ID
var BIT_Id = "6d9b15f09f67304fbd702249a8b58714";

// Array of Data Returned from Spotify
var spotifyArray = [];

// Client Token Grabber


$(document).ready(function () {

    // Changes Icons to White When Search Bars Are Active
    $("#search").focus(function() {
        $(".icon").css("color", "#ffffff");
    });

    // Changes Icons Back to Original Color When Search Bar is Inactive
    $('#search').focusout("focus", function () {
        $(".icon").css("color", "#4f5b66");
    });

    var URL = document.URL;
    
    // If Statement to check if user has not logged in to spotify (condition: access token not in url string)
    if ((URL).indexOf("access_token") === -1) {

        // Main Page Hidden
        $("#main-page").css("display", "none");

        // Click Event For Login
        $('.spotify-link').attr('href', 'https://accounts.spotify.com/en/authorize?response_type=token&client_id=ca5834e480c6461fba72bb35632ecead&redirect_uri=https:%2F%2Ftzlomke.github.io%2FProject_1%2F&scope=user-top-read%20user-library-read&state=123');

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
                    // Event Table Creation for Top Artist
                    for (var i = 0; i < response.length; i++) {
                        $("#event-table-body").append("<tr class='event-data'>" +
                            "<td class='venue'>" + response[i].venue.name + "</td>" +
                            "<td class='city'>" + response[i].venue.city + "</td>" +
                            "<td class='country'>" + response[i].venue.country + "</td>" +
                            "<td class='date'>" + moment(response[i].datetime).format("dddd, MMMM Do YYYY") + "</td>" +
                            "<td class='ticket-link'><a class='button' href=" + response[i].offers[0].url + "target='_blank'>Get Tickets</a></td>" +
                            "</tr>"
                        );
                    };
                });

                console.log(spotifyArray);

                // Artist Table Creation
                for (var i = 0; i < spotifyArray.length; i++) {
                    $("#artist-table").append("<tr class='artist-name' id=" +
                        spotifyArray[i].spotifyID + "><td class='artist-name-data'>" +
                        spotifyArray[i].artistName + "</td></tr>");
                };
            });
        };

        // Run Spotify API call function
        spotifyAPICall();

        // Search Function
        function searchArtists() {
            event.preventDefault();
            var userInput = $("#search").val().trim().toString();
            console.log(userInput);
            var queryURL1 = `https://api.spotify.com/v1/search?q=${userInput}&type=artist&${client_token}`;
            console.log(queryURL1);
            $.ajax({
                url: queryURL1,
                method: "GET",
                // Auth Token Passed to Spotify Here
                headers: {
                    "Authorization": "Bearer " + client_token
                }
            }).then(function (response) {
                var results1 = response.artists.items[0].id;
                console.log(results1);
                // passes data to Spotify music player
                $("iframe").attr("src", "https://open.spotify.com/embed/artist/" + results1);
                if (response.error != -1) {
                    // Invalid Search Error Modal
                    $("#invalidOpenModal").addClass("is-active");
                    $("#invalidCloseModal").click(function () {
                        $("#invalidOpenModal").removeClass("is-active");
                    });
                };
                $("#artist-table").prepend("<tr class='artist-name' id=" +
                        response.artists.items[0].id + "><td>" +
                        response.artists.items[0].name + "</td></tr>")
            });
        };
        
        // Keystroke event to launch search
        $("#search").keypress(function (e) {
            var userInput = $("#search").val().trim().toString();
            var key = e.which || e.keyCode;
            console.log(key);
            if (key === 13 && userInput === "") {
                // Empty Search Bar Error Modal
                $("#emptyOpenModal").addClass("is-active");
                $("#emptyCloseModal").click(function () {
                    $("#emptyOpenModal").removeClass("is-active");
                });
            } else if (key === 13) {
                searchArtists();
            }
        });

        // Click Events for Artist Table Rows
        $(document).on("click", "#artist-table .artist-name", function () {

            // Adds Class To Show Selected
            $(this).addClass("selected").siblings().removeClass("selected");

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
                        "<td class='venue'>" + response[i].venue.name + "</td>" +
                        "<td class='city'>" + response[i].venue.city + "</td>" +
                        "<td class='country'>" + response[i].venue.country + "</td>" +
                        "<td class='date'>" + moment(response[i].datetime).format("dddd, MMMM Do YYYY") + "</td>" +
                        "<td class='ticket-link'><a class='button' href=" + response[i].offers[0].url + ">Get Tickets</a></td>" +
                        "</tr>"
                    );
                };
            });
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