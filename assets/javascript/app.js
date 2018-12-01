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

// State to Abbreviation Converter
function abbrRegion(input, to) {
    var regions = [
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['District Of Columbia', 'DC'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Guam', 'GU'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    // Converts User Region Input to Proper Format
    if (to == 'abbr') {
        input = input.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        for (i = 0; i < regions.length; i++) {
            if (regions[i][0] == input) {
                return (regions[i][1]);
            }
        }
    } else if (to == 'name') {
        input = input.toUpperCase();
        for (i = 0; i < regions.length; i++) {
            if (regions[i][1] == input) {
                return (regions[i][0]);
            };
        };
    };
};

$(document).ready(function () {

    // Changes Icons to White When Search Bars Are Active
    $("#search").focus(function () {
        $(".icon").css("color", "#ffffff");
    });

    // Changes Icons Back to Original Color When Search Bar is Inactive
    $('#search').focusout("focus", function () {
        $(".icon").css("color", "#4f5b66");
    });

    // Scrolls to About Gigify Section
    $("#about-gigify-arrow").on("click", function() {
        $('html, body').animate({
            scrollTop: $("#about-gigify-container").offset().top
        }, 500);
    });

    // Saves Location to Local Storage and Logs In to Spotify
    $(".spotify-link").on("click", function () {

        // Converts Location Input to Proper Format
        var toAbbreviated = abbrRegion($(".location-search").val().trim(), 'abbr');
        var location = toAbbreviated;
        localStorage.clear();
        localStorage.setItem("location", location);
        if (!$(".location-search").val()) {
            $("#location-modal").addClass("is-active");
            $(".modal-close").on("click", function () {
                $("#location-modal").removeClass("is-active");
            });
        } else {
            $('.spotify-link').attr('href', 'https://accounts.spotify.com/en/authorize?response_type=token&client_id=ca5834e480c6461fba72bb35632ecead&redirect_uri=https:%2F%2Ftzlomke.github.io%2FProject_1%2F&scope=user-top-read%20user-library-read&state=123');
        };
    });

    var URL = document.URL;

    // If Statement to check if user has not logged in to spotify (condition: access token not in url string)
    if ((URL).indexOf("access_token") === -1) {

        // Main Page Hidden

        // UNCOMMENT WHEN DONE TESTING
        $("#main-page").css("display", "none");

        // Else statement (condition: access token in string). Main page functionality will occur within
    } else {

        // Landing Page Hidden
        $("#landing-page-container").css("display", "none");

        // Split URL multiple times so that only the characters of the token are returned in the end. (Spotify will only allow access to user profile if token is passed in as a "header" in AJAX call, see below).
        // (There's probably a DRYer way to do this, but this worked for now)
        var tokenArray = URL.split("#");
        var splitTokenArray = tokenArray[1].split("&");
        var finalTokenArray = splitTokenArray[0].split("=");
        var client_token = finalTokenArray[1];

        // Spotify AJAX call
        function spotifyAPICall() {
            var queryURL = "https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50";
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
                    if (response.length === 0) {
                        $("#event-table-body").append("<tr><td colspan='5' class='event-data'>No scheduled dates :(</td></tr>")
                    } else {
                        for (var i = 0; i < response.length; i++) {
                            // Places Local Shows First
                            if (localStorage.getItem("location") === response[i].venue.region){
                                $("#event-table-body").prepend("<tr class='event-data near-you'>" +
                                    "<td class='venue'>" + response[i].venue.name + "</td>" +
                                    "<td class='city'>" + response[i].venue.city + "</td>" +
                                    "<td class='country'>" + response[i].venue.country + "</td>" +
                                    "<td class='date'>" + moment(response[i].datetime).format("dddd, MMMM Do YYYY") + "</td>" +
                                    "<td class='ticket-link'><a class='button ticket-click' href=" + response[i].offers[0].url + "target='_blank'>Get Tickets</a></td>" +
                                    "</tr>"
                                );
                            } else {
                                $("#event-table-body").append("<tr class='event-data'>" +
                                    "<td class='venue'>" + response[i].venue.name + "</td>" +
                                    "<td class='city'>" + response[i].venue.city + "</td>" +
                                    "<td class='country'>" + response[i].venue.country + "</td>" +
                                    "<td class='date'>" + moment(response[i].datetime).format("dddd, MMMM Do YYYY") + "</td>" +
                                    "<td class='ticket-link'><a class='button ticket-click' href=" + response[i].offers[0].url + "target='_blank'>Get Tickets</a></td>" +
                                    "</tr>"
                                );
                            };
                        };
                    };
                });

                // Artist Table Creation
                for (var i = 0; i < spotifyArray.length; i++) {
                    $("#artist-table").append("<tr class='artist-name' id=" +
                        spotifyArray[i].spotifyID + "><td class='artist-name-data'>" +
                        spotifyArray[i].artistName + "</td></tr>");
                };
                // Highlights first in artist table
                $("#artist-table td:first").addClass("selected");
            });
        };

        // Run Spotify API call function
        spotifyAPICall();

        // Search Function
        function searchArtists() {
            event.preventDefault();
            var userInput = $(".artist-search").val().trim().toString();
            var queryURL1 = `https://api.spotify.com/v1/search?q=${userInput}&type=artist&${client_token}`;
            $.ajax({
                url: queryURL1,
                method: "GET",
                // Auth Token Passed to Spotify Here
                headers: {
                    "Authorization": "Bearer " + client_token
                }
            }).then(function (response) {
                var results1 = response.artists.items[0].id;
                // passes data to Spotify music player
                $("iframe").attr("src", "https://open.spotify.com/embed/artist/" + results1);
                // Removes selected class from previous siblings
                $("#artist-table>tr>td.selected").removeClass("selected");
                // Adds New Artist to Table and Highlights
                $("#artist-table").prepend("<tr class='artist-name selected' id=" +
                    response.artists.items[0].id + "><td class='artist-name-data'>" +
                    response.artists.items[0].name + "</td></tr>");
                $.ajax({
                    url: "https://rest.bandsintown.com/artists/" + userInput+ "/events?app_id=" + BIT_Id,
                    method: "GET"
                }).then(function (response) {
                    // Event Table Creation for Top Artist
                    if (response.length === 0) {
                        $("#event-table-body").append("<tr><td colspan='5' class='event-data'>No scheduled dates :(</td></tr>")
                    } else {
                        for (var i = 0; i < response.length; i++) {
                            // Places Local Shows First
                            if (localStorage.getItem("location") === response[i].venue.region){
                                $("#event-table-body").prepend("<tr class='event-data near-you'>" +
                                    "<td class='venue'>" + response[i].venue.name + "</td>" +
                                    "<td class='city'>" + response[i].venue.city + "</td>" +
                                    "<td class='country'>" + response[i].venue.country + "</td>" +
                                    "<td class='date'>" + moment(response[i].datetime).format("dddd, MMMM Do YYYY") + "</td>" +
                                    "<td class='ticket-link'><a class='button ticket-click' href=" + response[i].offers[0].url + "target='_blank'>Get Tickets</a></td>" +
                                    "</tr>"
                                );
                            } else {
                                $("#event-table-body").append("<tr class='event-data'>" +
                                    "<td class='venue'>" + response[i].venue.name + "</td>" +
                                    "<td class='city'>" + response[i].venue.city + "</td>" +
                                    "<td class='country'>" + response[i].venue.country + "</td>" +
                                    "<td class='date'>" + moment(response[i].datetime).format("dddd, MMMM Do YYYY") + "</td>" +
                                    "<td class='ticket-link'><a class='button ticket-click' href=" + response[i].offers[0].url + "target='_blank'>Get Tickets</a></td>" +
                                    "</tr>"
                                );
                            };
                        };
                    };
                });
            });
        };

        // Keystroke event to launch search
        $(".artist-search").on("keyup", function (e) {
            var key = e.which
            var inputVal = $(".artist-search").val().trim();
            console.log(inputVal);
            if (key == 13 && inputVal.length >= 1) {
                searchArtists();
            } else if (key == 13 && inputVal.length == 0) {
                $("#search-modal").addClass("is-active");
                $(".modal-close").click(function () {
                    $("#search-modal").removeClass("is-active");
                });
            }
        });

        // Click Events for Artist Table Rows
        $(document).on("click", "#artist-table .artist-name", function () {

            // Removes Selected Class from First Element
            $("#artist-table td:first").removeClass("selected");

            // Adds Class To Show Selected (Will add back to first if necessary since it runs after removeClass method)
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
                if (response.length === 0) {
                    $("#event-table-body").append("<tr><td colspan='5' class='event-data'>No scheduled dates :(</td></tr>")
                } else {
                    for (var i = 0; i < response.length; i++) {
                        // Places Local Shows First
                        if (localStorage.getItem("location") === response[i].venue.region){
                            $("#event-table-body").prepend("<tr class='event-data near-you'>" +
                                "<td class='venue'>" + response[i].venue.name + "</td>" +
                                "<td class='city'>" + response[i].venue.city + "</td>" +
                                "<td class='country'>" + response[i].venue.country + "</td>" +
                                "<td class='date'>" + moment(response[i].datetime).format("dddd, MMMM Do YYYY") + "</td>" +
                                "<td class='ticket-link'><a class='button ticket-click' href=" + response[i].offers[0].url + "target='_blank'>Get Tickets</a></td>" +
                                "</tr>"
                            );
                        } else {
                            $("#event-table-body").append("<tr class='event-data'>" +
                                "<td class='venue'>" + response[i].venue.name + "</td>" +
                                "<td class='city'>" + response[i].venue.city + "</td>" +
                                "<td class='country'>" + response[i].venue.country + "</td>" +
                                "<td class='date'>" + moment(response[i].datetime).format("dddd, MMMM Do YYYY") + "</td>" +
                                "<td class='ticket-link'><a class='button ticket-click' href=" + response[i].offers[0].url + "target='_blank'>Get Tickets</a></td>" +
                                "</tr>"
                            );
                        }
                    };
                };
            });
        });

        // Stores Ticket Clicks to Firebase
        // Stores Ticket Clicks to Firebase
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