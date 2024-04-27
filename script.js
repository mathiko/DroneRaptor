//Variables for saving the leaflet-map, as well as the marker that appears when a position is clicked on the map.
var mymap;
var marker;

//Variables to store lat and long for two different positions.
var lat; var lng; var lat2; var lng2;

//Adds an eventlistener to the whole HTML-page to check for when the document is loaded completely. The DOMContentLoaded eventlistener ensures that the javascript-code linked to the page doesn't run before the whole HTML-structure is fully loaded. This is done to prevent errors due to javascript-code being run without being successfully linked to the HTML-document and its elements.
document.addEventListener('DOMContentLoaded', function() {
    //A leaflet (L) map is stored in the mymap variable with a start-position (Tønsberg) with zoom level 13.
    mymap = L.map('mapid').setView([59.2710, 10.4051], 13);

    //This adds the visible layer of the map, and it is accessed from openstreetmap.org.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mymap);

    //Adds a geocoder variable with geocoder functionality, which lets the user search of any location in the world and see it on the map.
    var geocoder = L.Control.geocoder({
        defaultMarkGeocode: true, //Does not add a marker on the location searched for.
        placeholder: 'Search for a place...' //Placeholder for the search input.
    }).addTo(mymap);

    //Function to show the searched location on the map (mymap).
    geocoder.on('markgeocode', function(e) {
        var latlng = e.geocode.center; //Variable to store the lat and longitude based on geocode-locations.
        var lat = latlng.lat; //Stores only the geocode-lat.
        var lng = latlng.lng; //Stores only the geocode-lng.

        //If there is already a marker on the map, it is removed an changed with a new one when a location is searched for.
        if (marker != null) {
            mymap.removeLayer(marker);
        }
        mymap.setView([lat, lng], 14); //Sets the view of mymap to the searched position.
    });

    //This is an on-click eventlistener, and it always checks if something is being pressed. In this case, it checks if the map is pressed, and if its pressed, it stores the lat and long that were pressed on the map (mymap).
    mymap.on('click', function(e) {
        //Loads in the checkbox-element from the html-document.
        const checkbox = document.getElementById("checkbox");

        //Function that adds to the first position (lat and lng).
        function addToFirst() {
            //e.lating.lat/lng is the function that gets the location where the map is pressed. e stands for event object, and latlng is the function used, and then lat or lng is specified based on which one you want. In this case we store both lat and long with 4 decimals.
            lat = e.latlng.lat.toFixed(4);
            lng = e.latlng.lng.toFixed(4);
            //Sends the lat and long back to the startlat and startlong inputfields in the html-document.
            document.getElementById("startlat").value = lat;
            document.getElementById("startlong").value = lng;
        }

        //Function that adds to the second position (lat2 and lng2).
        function addToSecond() {
            lat2 = e.latlng.lat.toFixed(4);
            lng2 = e.latlng.lng.toFixed(4);
            //Sends the lat and long back to the stoplat and stoplong inputfields in the html-document.
            document.getElementById("stoplat").value = lat2;
            document.getElementById("stoplong").value = lng2;
        }

        //Function that searches every layer of the leaflet-map (mymap), and if any of the layers are a marker that is not custom-made, it is removed.
        function removeDefaultGeocoderMarker() {
            //This works like a foreach-loop, and it goes through all layers of the referenced map (mymap) and does what you want it to do for each layer.
            mymap.eachLayer(function(layer) {
                // Check if the current layer is a marker, and removes it if its a not a custom one. If the current layer (layer) is an instance of a marker (L.Marker) and the "customMarker" option-flag is not true, it will remove the marker.
                if (layer instanceof L.Marker && !layer.options.customMarker) {
                    //Removes the current layer.
                    mymap.removeLayer(layer);
                }
            });
        }

        //If the checkbox for path motion is not checked, only the first position is used. There is no end position.
        if (!checkbox.checked) {
            lat = e.latlng.lat.toFixed(4);
            lng = e.latlng.lng.toFixed(4);
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;

            //If there is a marker already present on the map (mymap), it is removed, and a new one is added.
            if (marker != null) {
                mymap.removeLayer(marker);
            }
            
            //If there is a standard marker from a location search on the map, it is removed before adding the custom one.
            removeDefaultGeocoderMarker();
            //Creates a new marker to the chosen position, and adds it to the map (mymap). L stands for Leaflet.
            marker = L.marker([lat, lng]).addTo(mymap);
        }

        //If the checkbox is checked, we use both start and stop position, and therefore both lat,lng,lat2,lng2.
        else {
            //If the first position is not chosen (if either lat or lng is not given a value), we add the coordinates pressed on the map to the inputfields for the first position.
            if ((lat == null) || (lng == null)) {
                addToFirst();
            }

            //If both of the inputfields for position one is given values, and either lat2 or lng2 is not given a value, we add to the inputfields for the second position.
            else if (((lat != null) && (lng != null)) && ((lat2 == null) || (lng2 == null))){
                addToSecond();
            }

            //If both lat and lng is given a value for both first and second position, we start over and give the pressed location to the first position again.
            else if ((lat != null) && (lng != null) && (lat2 != null) && (lng2 != null)) {
                // Resets the second position to make sure the if-statements above will work as wanted when we start over.
                lat2 = null;
                lng2 = null;
                document.getElementById("stoplat").value = lat2;
                document.getElementById("stoplong").value = lng2;
                addToFirst();
            }
        }
    });
});

//This is a counter to make sure the correct value is given to the new locations added, so that the positions added to the select dropdownmenu gets the correct indexation. There are two standard positions, which is indexed 0 and 1, and therefore we start this at 1, so that the next element added gets the index 2.
var indexCount = 1;

//Function that calculates the speed using the two positions given as arguments.
function calculateSpeedAuto(lat1, lng1, lat2, lng2, dur) {
    //Displays the speed on the website.
    document.getElementById("speed").textContent = `${lat1},${lng1},${lat2},${lng2},${dur}`;
}

function calculateSpeedButton() {
    const lat1 = document.getElementById('startlat').value;
    const lng1 = document.getElementById('startlong').value;
    const lat2 = document.getElementById('stoplat').value;
    const lng2 = document.getElementById('stoplong').value;
    const dur = document.getElementById('duration-input').value;
    if ((lat1 != (null || "")) && (lng1 != (null || "")) && (lat2 != (null || "")) && (lng2 != (null || "")) && (dur != (null || "" || 0))) {
        document.getElementById("speed").style.color = "black";
    	document.getElementById("speed").textContent = `Speed: 69 xD`;
    }
    else {
        document.getElementById("speed").style.color = "red";
    	document.getElementById("speed").textContent = "Missing argument(s) to calculate speed.";
    }
}

//This function is called when we want an error message displayed. It changes the error/file-success-message displaytype from "none" to "block", which makes it visible, and then styles it.
function displayErrorMessage(message) {
    //Changes the content of the element to whats send to the function.
    document.getElementById('error/file-success-message').textContent = message;
    //Changes the element displaytype from "none" to "block".
    document.getElementById('error/file-success-message').style.display = 'block';
    //Changes the styling of the message.
    document.getElementById('error/file-success-message').style.color = "red";
    document.getElementById('error/file-success-message').style.fontWeight = "bold";
    document.getElementById('error/file-success-message').style.fontSize = "20";
}

//This function is called when we want a success-message from creating a file displayed. It changes the error/file-success-message displaytype from "none" to "block", which makes it visible, and then styles it.
function displaySuccessMessageFile(message) {
    document.getElementById('error/file-success-message').textContent = message;
    document.getElementById('error/file-success-message').style.display = "block";
    document.getElementById('error/file-success-message').style.color = "darkgreen";
    document.getElementById('error/file-success-message').style.fontWeight = "bold";
    document.getElementById('error/file-success-message').style.fontSize = "20";
}

//This does the same as the displaySuccessMessageFile-function, except this puts the spoofing success-message in a seperate div so we are able to display both "Jamming...", "Spoofing..." and creating file success-message simultaneously.
function displaySuccessMessageSpoof(message) {
    document.getElementById('success-message-spoof').textContent = message;
    document.getElementById('success-message-spoof').style.display = 'block';
    document.getElementById('success-message-spoof').style.color = "darkgreen";
    document.getElementById('success-message-spoof').style.fontWeight = "bold";
    document.getElementById('success-message-spoof').style.fontSize = "20";
}

function displaySuccessMessageJam(message) {
    document.getElementById('success-message-jam').textContent = message;
    document.getElementById('success-message-jam').style.display = 'block';
    document.getElementById('success-message-jam').style.color = "darkgreen";
    document.getElementById('success-message-jam').style.fontWeight = "bold";
    document.getElementById('success-message-jam').style.fontSize = "20";
}

//This function hides the error/file-success-message, and therefore changes the displaytype from "block" to "none", which effectively hides the content of the element.
function hideMessageFile() {
    document.getElementById('error/file-success-message').style.display = 'none';
}

//This function hides the spoofing success-message, and therefore changes the displaytype from "block" to "none", which effectively hides the content of the element.
function hideMessageSpoof() {
    document.getElementById('success-message-spoof').style.display = 'none';
}

function hideMessageJam() {
    document.getElementById('success-message-jam').style.display = 'none';
}

//This function starts the process of spoofing when the "start spoofing"-button is pressed.
function spoofStart() {
    //Variable to store the index-value of the chosen location from the location dropdown-menu.
    const index = document.getElementById("location-select").value;
    hideMessageFile(); //Removes success message from file creation when starting spoof-process.
    displaySuccessMessageSpoof("Spoofing..."); //Displays "spoofing..." when starting spoof-process.
    //Fetch connects to the "spoof-request" endpoint made on the server, and then POST's index to it as JSON format.
    fetch("/spoof-request", {
        method: "POST", //Declares what type of HTTP-method to use.
        headers: { //Declares what type of content will be sent with the POST.
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }), //Converts the index to JSON-format, and appends it to the POST-body.
    })
    .then(response => { //.then happens after the fetch, and takes care of the response. If the respons.ok is true, the HTTP-request was successful. If it was not ok, the request was unsuccessful.
        if (response.ok) {
            console.log("Spoofing stopped successfully."); //Logs in the terminal that spoofing stopped.
        } 
        
        else {
            response.json().then(data => { //If the response was not ok, we read the response JSON-data and print the data-message.
                console.log("Failed to start spoofing:", data.message);
                displayErrorMessage(data.message); //We display the errormessage on the HTML-page.
            });
        }
    })
    .catch((error) => { //If anything were to go wrong while calling the fetch-function, the catch will write an error to both the terminal and the HTML-page.
        console.log("Error:", error);
        displayErrorMessage("Unknown error, inspect it further in console.");
    });
}

function jamStart() {
    const index = document.getElementById("jam-select").value;
    hideMessageFile();
    displaySuccessMessageJam("Jamming...");
    fetch("/jam-request", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }),
    })
    .then(response => {
        if (response.ok) {
            console.log("Jamming stopped successfully.");
        } 
        
        else {
            response.json().then(data => {
                console.log("Failed to start jamming:", data.message);
                displayErrorMessage(data.message);
            });
        }
    })
    .catch((error) => {
        console.log("Error:", error);
        displayErrorMessage("Unknown error, inspect it further in console.");
    });
}

//This function requests the stop spoofing-function from on the server.
function stopSpoof() {
    //Hides the "spoofing...".
    hideMessageSpoof();
    fetch("/stop-spoof-request", {
        method: "POST",
	headers: {
            "Content-Type": "application/json",	
        },
    })
    .then(response => {
    //If reponse.ok is false, which indicates the process is not running, we display errormessage in the html-document.
	if (!response.ok) {
	    displayErrorMessage("No spoofing-process is running.");
	}
    })
    .catch((error) => {
	console.log("Error:", error);
	displayErrorMessage("Unknown error, inspect it further in the console.");
    });
}

function stopJam() {
    hideMessageJam();
    fetch("/stop-jam-request", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (!response.ok) {
            displayErrorMessage("No jamming-process is running.");
        } 
    })
    .catch((error) => {
        console.log("Error:", error);
        displayErrorMessage("Unknown error, inspect it further in console.");
    });
}

//This is the function that is called everytime the checkbox is pressed, and overall it disables or enables the path motion function of the spoofing.
function disableEnable() {
    const box = document.getElementById("checkbox"); //Variable that refers to the checkbox element.
    const latitude = document.getElementById("latitude"); //Variable that refers to the static latitude.
    const longitude = document.getElementById("longitude"); //Variable that refers to the static longitude.
    const startlat = document.getElementById("startlat"); //Variable that refers to the startlat.
    const startlong = document.getElementById("startlong"); //Variable that refers to the startlong.
    const stoplat = document.getElementById("stoplat"); //Variable that refers to the stoplat.
    const stoplong = document.getElementById("stoplong"); //Variable that refers to the stoplong.

    //If checkbox is not checked, all the inputfields regarding the path motion is disabled so that they cant be changed, and the static ones are enabled.
    if (!box.checked) {
        //latitude- and longitude.disable is set to false for the static lat and long. The start and stop-cords.disabled is set to true.
        latitude.disabled = false; longitude.disabled = false;
        startlat.disabled = true; startlong.disabled = true; stoplat.disabled = true; stoplong.disabled = true;
        document.getElementById("speed").textContent = "";
        //All coordinates are reset when changing from static to motion.
        lat = null; lng = null; lat2 = null; lng2 = null;
        //Send the reset variables (null) to the inputfields in the html-document.
        document.getElementById("startlat").value = lat;
        document.getElementById("startlong").value = lng;
        document.getElementById("stoplat").value = lat2;
        document.getElementById("stoplong").value = lng2;

        //If there is a marker when the functionality is changed from static to motion or vice versa, the marker is removed.
        if (marker != null) {
            mymap.removeLayer(marker);
        }
    }

    else {
        //Same as in the first if-statement, but opposite.
        latitude.disabled = true; longitude.disabled = true;
        startlat.disabled = false; startlong.disabled = false; stoplat.disabled = false; stoplong.disabled = false;
        //Only lat and lng is reset. lat2 and lng2 is already null, as they are initially null, and they have not been assigned any value in first if-statement.
        lat = null; lng = null;
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;

        if (marker != null) {
            mymap.removeLayer(marker);
        }
    }
}

//This function creates new location-file, and it uses two different fetches based on wheter motion is enabled or disabled. This is neccessary since the fetch uses more parameters when creating a motion-file than if it creates a static file. The function is called when pressing the "create location file"-button.
function createLocationFile() {
    //Declaring two different sanitizement-segments to test and validate different inputs.
    const sanArgument1 = /^[a-z_]+$/; //This segments allows only small letters from a-z, as well as underscore.
    const sanArgument2 = /^[+]?(\d+(\.\d*)?|\.\d+)$/; //This segment only allows positive numbers.
    const sanArgument3 = /^[+-]?(\d+(\.\d*)?|\.\d+)$/ //This segment allows both positive and negative numbers.
    const filename = document.getElementById('filename-input').value; //Variable that refers to the "filename-input"-value.
    const dur = document.getElementById("duration-input").value; //Variable that refers to the "duration-input"-value.
    const checkbox = document.getElementById("checkbox"); //Variable that refers to the checkbox.

    //Displays errormessage if filename isn't provided.
    if (filename == '') {
        displayErrorMessage('Filename cannot be empty.');
        return; //Stops further code-execution.
    }

    //Displays errormessage if filename contains any non-valid characters.
    else if (!sanArgument1.test(filename)) {
        displayErrorMessage('Filename can only contain small letters and underscores.');
        return;
    }

    //Displays errormessage if duration is not provided.
    if (dur == "") {
        displayErrorMessage("Duration must be provided.");
        return;
    }

    //Display errormessage if duration is not a positive number.
    else if (!(sanArgument2.test(dur))) {
        displayErrorMessage("Duration must be a positive number.");
        return;
    }

    //If static position is selected, only the lat and lng-inputs are tested and sanitized.
    if (!checkbox.checked) {
        //Variables referring to lat and lng.
        const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;

        //Displays errormessage if lat or lng are not provided.
        if (lat == "" || lng == "") {
            displayErrorMessage('Latitude and longitude must be provided.');
            return;
        }

        //Displays errormessage if lat and lng is not a positive number.
        else if (!(sanArgument3.test(lat)) || !(sanArgument3.test(lng))) {
            displayErrorMessage("Latitude and longitude must be a positive number.")
            return;
        }
    }

    //If motion is selected, inputs for both start- and stop-positions are sanitized.
    else {
        //Variables referring to lat, lng, lat2, lng2.
        const lat = document.getElementById('startlat').value;
        const lng = document.getElementById('startlong').value;
        const lat2 = document.getElementById('stoplat').value;
        const lng2 = document.getElementById('stoplong').value;

        //Displays errormessage if lat, lng, lat2 or lng2 are not provided.
        if ((lat == "") || (lng == "") || (lat2 == "") || (lng2 == "")) {
            displayErrorMessage('Latitude and longitude must be provided for both start and stop location.');
            return;
        }

        //Displays errormessage if lat, lng, lat2 or lng2 are not positive numbers.
        else if (!(sanArgument3.test(lat)) || !(sanArgument3.test(lng)) || !(sanArgument3.test(lat2)) || !(sanArgument3.test(lng2))) {
            displayErrorMessage("Latitude and longitude must be a positive number.")
            return;
        }
    }

    //Variable reffering to the dropdown location-select.
    const locationSelect = document.getElementById('location-select');
    //For loop that checks all existing objects in location-list, and makes sure there is not any objects with the same name as the one we now try to add.
    for (let i = 0; i < locationSelect.options.length; i++) {
        //Tests if the text-content of each object in the location list is equal to the filename we try to add, and displays an error of its matches any of them.
        if (locationSelect.options[i].textContent === filename) {
            displayErrorMessage('Location with the same name already exists.');
            return;
        }
    }

    //Uses two different fetches, based on if static position or motion is chosen.
    if (!checkbox.checked) {
    	const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;
        //Writes message to html when creating file.
        displaySuccessMessageFile("Creating location-file...");
        console.log('Creating location-file...');
        fetch('/create-location-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            //Converts lat, lng and dur to JSON-format, and appends it to the POST-body.
            body: JSON.stringify({ filename: filename, lat, lng, dur }),
        })
        .then(response => {
            if (response.ok) {
                //If the request works as expected, the location is added to the location dropdown-list.
                addLocationToSelect(filename);
                //Success-message is written when the respond is ended (res.end()) from server, and the file-creating process is complete.
                displaySuccessMessageFile("Location-file was created successfully.")
            } 

            else {
                response.json().then(data => {
                    console.log('Failed to create location-file:', data.message);
                    displayErrorMessage(data.message);
                });
            }
        })
        .catch((error) => {
            console.log('Error:', error);
            displayErrorMessage('Unknown error, inspect it further in console.');
        });
    }

    else { 
    	const lat = document.getElementById('startlat').value;
        const lng = document.getElementById('startlong').value;
        const lat2 = document.getElementById('stoplat').value;
        const lng2 = document.getElementById('stoplong').value;
        displaySuccessMessageFile("Creating motion-file...");
        console.log('Creating motion-file...');
        fetch('/create-motion-location-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: filename, lat, lng, lat2, lng2, dur }),
        })
        .then(response => {
            if (response.ok) {
                addLocationToSelect(filename);
                displaySuccessMessageFile("Motion-file was created successfully.")
            } 
            
            else {
                response.json().then(data => {
                    console.log('Failed to create motion-file:', data.message);
                    displayErrorMessage(data.message);
                });
            }
        })
        .catch((error) => {
            console.log('Error:', error);
            displayErrorMessage('Unknown error, inspect it further in console.');
        });
    }
}

//Function that adds filename width correct index to the location dropdown-list.
function addLocationToSelect(filename) {
    indexCount = indexCount + 1; //Adds 1 to the list-object-index.
    const selectElement = document.getElementById('location-select'); //Variable that refers to the dropdown-select.
    const option = document.createElement('option'); //Creates a new option that will later be added to the select dropdown-list.
    option.value = indexCount; //Changes the value (index) of the new option. 
    option.textContent = filename; //Changes the textcontent of the new option to the filename.
    selectElement.appendChild(option); //Appends the new option to the select-menu.
}
