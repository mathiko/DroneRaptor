document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map on the "mapid" div with a given center and zoom
    var mymap = L.map('mapid').setView([51.505, -0.09], 13);

    // Set up the OSM layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mymap);

    // Add a click event listener to the map
    mymap.on('click', function(e) {
        var lat = e.latlng.lat.toFixed(6); // Limit decimals to 6
        var lng = e.latlng.lng.toFixed(6); // Limit decimals to 6
       
        // Update latitude and longitude on the webpage with enhanced visibility
        document.getElementById('latitude').textContent = lat;
        document.getElementById('longitude').textContent = lng;
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

// Add function to create location file
function createLocationFile() {
    const filenameInput = document.getElementById('filename-input');
    const filename = filenameInput.value.trim().toLowerCase(); // Trim and convert to lowercase
    const sanitizedFilename = filename.replace(/[^a-z_]/g, ''); // Remove characters other than small letters and underscore
    filenameInput.value = sanitizedFilename; // Update the input value with sanitized filename

    if (sanitizedFilename !== filename) {
        displayErrorMessage('Filename can only contain small letters and underscores.');
        return;
    }

    if (sanitizedFilename === '') {
        displayErrorMessage('Filename cannot be empty.');
        return;
    }

    const lat = document.getElementById('latitude').textContent;
    const lon = document.getElementById('longitude').textContent;

    if (lat === '' || lon === '') {
        displayErrorMessage('Latitude and longitude must be provided.');
        return;
    }

    const locationSelect = document.getElementById('location-select');
    // Check if the filename already exists in the select list
    for (let i = 0; i < locationSelect.options.length; i++) {
        if (locationSelect.options[i].textContent.toLowerCase() === sanitizedFilename) {
            displayErrorMessage('Location with the same name already exists.');
            return;
        }
    }

    // Send filename, latitude, and longitude to server to create location file
    fetch('/create-location-file', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: sanitizedFilename, lat, lon }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Location file created successfully');
            addLocationToSelect(sanitizedFilename); // Append new location to select list
            hideErrorMessage(); // Hide error message if file creation succeeds
        } else {
            throw new Error('Failed to create location file');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        displayErrorMessage('Error occurred. Please try again.'); // Display general error message in HTML
    });
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