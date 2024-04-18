var mymap; // Declare mymap in the global scope

var marker; // Declare marker in the global scope

var lat;
var lng;
var lat2;
var lng2;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map on the "mapid" div with a given center and zoom
    mymap = L.map('mapid').setView([59.2710, 10.4051], 13);

    // Set up the OSM layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mymap);

    // Add a click event listener to the map
    mymap.on('click', function(e) {
        const checkbox = document.getElementById("checkbox");

        function addToFirst() {
            lat = e.latlng.lat.toFixed(4);
            lng = e.latlng.lng.toFixed(4);
            document.getElementById("startlat").value = lat;
            document.getElementById("startlong").value = lng;
        }

        function addToSecond() {
            lat2 = e.latlng.lat.toFixed(4);
            lng2 = e.latlng.lng.toFixed(4);
            document.getElementById("stoplat").value = lat2;
            document.getElementById("stoplong").value = lng2;
        }

        if (!checkbox.checked) {
            lat = e.latlng.lat.toFixed(4); // Limit decimals to 6
            lng = e.latlng.lng.toFixed(4); // Limit decimals to 6

            // Update latitude and longitude on the webpage with enhanced visibility
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;

            if (marker) {
                mymap.removeLayer(marker);
            }

            // Add marker at clicked location
            marker = L.marker([lat, lng]).addTo(mymap);
        }

        else {
            if (lat == null && lng == null) {
                addToFirst();
            }
            else if ((lat != null && lng != null) && (lat2 == null && lng2 == null)){
                addToSecond();
            }
            else if (lat != null && lng != null && lat2 != null && lng2 != null) {
                lat2 = null;
                lng2 = null;
                document.getElementById("stoplat").value = lat2;
                document.getElementById("stoplong").value = lng2;
                addToFirst();
            }
        }
    });
});

var indexCount = 1;

// Add function to display error message in HTML
function displayErrorMessage(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Add function to hide error message in HTML
function hideErrorMessage() {
    const errorElement = document.getElementById('error-message');
    errorElement.style.display = 'none';
}

// Modify spoofFile function to handle error message from the server
function spoofFile() {
    const index = document.getElementById('location-select').value;
  
    // Send index to server
    fetch('/spoof-file', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Spoofing process started');
            hideErrorMessage(); // Hide error message if spoofing process starts
        } else {
            response.json().then(data => {
                console.error('Failed to start spoofing process:', data.message);
                displayErrorMessage(data.message); // Display error message in HTML
            });
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        displayErrorMessage('Error occurred. Please try again.'); // Display general error message in HTML
    });
}

function disableEnable() {
    const box = document.getElementById("checkbox");
    const latitude = document.getElementById("latitude");
    const longitude = document.getElementById("longitude");
    const startlat = document.getElementById("startlat");
    const startlong = document.getElementById("startlong");
    const stoplat = document.getElementById("stoplat");
    const stoplong = document.getElementById("stoplong");

    if (!box.checked) {
        latitude.disabled = false;
        longitude.disabled = false;
        startlat.disabled = true;
        startlong.disabled = true;
        stoplat.disabled = true;
        stoplong.disabled = true;
        lat = null;
        lng = null;
        lat2 = null;
        lng2 = null;
        document.getElementById("startlat").value = lat;
        document.getElementById("startlong").value = lng;
        document.getElementById("stoplat").value = lat2;
        document.getElementById("stoplong").value = lng2;
        if (marker != null) {
            mymap.removeLayer(marker);
        }
    }
    else {
        latitude.disabled = true;
        longitude.disabled = true;
        startlat.disabled = false;
        startlong.disabled = false;
        stoplat.disabled = false;
        stoplong.disabled = false;
        lat = null;
        lng = null;
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
        if (marker != null) {
            mymap.removeLayer(marker);
        }
    }
}

// Add function to create location file
function createLocationFile() {

    const filename = document.getElementById('filename-input').value;
    const dur = document.getElementById("duration-input").value;
    const checkbox = document.getElementById("checkbox");

    if (filename == '') {
        displayErrorMessage('Filename cannot be empty.');
        return;
    }

    else if (!/^[a-z_]+$/.test(filename)) {
        displayErrorMessage('Filename can only contain small letters and underscores.');
        return;
    }

    if (dur == "") {
        displayErrorMessage("Duration must be provided.");
        return;
    }

    else if (!(/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(dur))) {
        displayErrorMessage("Duration must be a number.");
        return;
    }

    if (!checkbox.checked) {
        const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;

        if (lat == "" || lng == "") {
            displayErrorMessage('Latitude and longitude must be provided.');
            return;
        }
        else if (!(/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(lat)) || !(/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(lng))) {
            displayErrorMessage("Latitude and longitude must be a number.")
            return;
        }
    }
    else {
        const lat = document.getElementById('startlat').value;
        const lng = document.getElementById('startlong').value;
        const lat2 = document.getElementById('stoplat').value;
        const lng2 = document.getElementById('stoplong').value;

        if (lat == "" || lng == "" || lat2 == "" || lng2 == "") {
            displayErrorMessage('Latitude and longitude must be provided for both start and stop location.');
            return;
        }
        else if (!(/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(lat)) || !(/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(lng)) || !(/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(lat2)) || !(/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(lng2))) {
            displayErrorMessage("Latitude and longitude must be a number.")
            return;
        }
    }

    const locationSelect = document.getElementById('location-select');
    // Check if the filename already exists in the select list
    for (let i = 0; i < locationSelect.options.length; i++) {
        if (locationSelect.options[i].textContent === filename) {
            displayErrorMessage('Location with the same name already exists.');
            return;
        }
    }

    // Send filename, latitude, and longitude to server to create location file
    if (!checkbox.checked) {
        fetch('/create-location-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: filename, lat, lng, dur }),
        })
        .then(response => {
            if (response.ok) {
                console.log('Location file created successfully');
                addLocationToSelect(filename); // Append new location to select list
                hideErrorMessage(); // Hide error message if file creation succeeds
            } else {
                throw new Error('Failed to create location file');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            displayErrorMessage('Error occurred. Please try again.'); // Display general error message in HTML
        });
    }

    else {
        fetch('/create-motion-location-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: filename, lat, lng, lat2, lng2, dur }),
        })
        .then(response => {
            if (response.ok) {
                console.log('Location file created successfully');
                addLocationToSelect(filename); // Append new location to select list
                hideErrorMessage(); // Hide error message if file creation succeeds
            } else {
                throw new Error('Failed to create location file');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            displayErrorMessage('Error occurred. Please try again.'); // Display general error message in HTML
        });
    }
    indexCount = indexCount + 1;
}

// Add function to dynamically add new location to select list
function addLocationToSelect(filename) {
    const selectElement = document.getElementById('location-select');
    const option = document.createElement('option');
    option.value = indexCount;
    option.textContent = filename;
    selectElement.appendChild(option);
}