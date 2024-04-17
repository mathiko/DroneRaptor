const express = require('express');
const { exec } = require('child_process');
const os = require('os');
const app = express();
const port = 3000;

let currentProcess = null; // Variable to store the current child process

// Get the username of the current user
const username = os.userInfo().username;
// Set up the static parameters
const staticParams = '-s 2600000 -f 1575420000 -a 0 -x 0'; // Add other static parameters here
const scriptPath = "/usr/bin/hackrf_transfer";
// Define a list to store location parameters
const locationParameters = [
    { name: 'brotorvet', path: `/home/${username}/gps-sdr-sim/brotorvet.bin` },
    { name: 'kiel', path: `/home/${username}/gps-sdr-sim/kiel.bin` }
    // Add more locations and parameters as needed
];

app.use(express.json());
app.use(express.static('public'));

app.post('/spoof-file', (req, res) => {
    const { index } = req.body;

    // Check if the process is running before executing the command
    checkProcessRunning("hackrf_transfer", (isRunning) => {
        if (!isRunning) {
            console.log("\nSpoofing started successfully.")
            executeCommand(res, index);
        } else {
            console.log("Process is already active, press the HackRFone reset-button and try again.");
            res.status(400).send({ message: 'Process is already active, press the HackRFone reset-button and try again.' }); // Send error message to client
        }
    });
});

app.post('/create-location-file', (req, res) => {
    const { filename, lat, lng, dur } = req.body;
    // For now, assuming filename is the name of the location
    const newLocation = { name: filename, path: `/home/${username}/gps-sdr-sim/${filename}.bin` };
    locationParameters.push(newLocation);
    // Run the command to create the location file
    createLocationFileInTerminal(filename, lat, lng, dur, res);
});

app.post('/create-motion-location-file', (req, res) => {
    const { filename, lat, lng, lat2, lng2, dur } = req.body;
    // For now, assuming filename is the name of the location
    const newLocation = { name: filename, path: `/home/${username}/gps-sdr-sim/${filename}.bin` };
    locationParameters.push(newLocation);
    // Run the command to create the location file
    createMotionLocationFileInTerminal(filename, lat, lng, lat2, lng2, dur, res);
});

function executeCommand(res, index) {
    // Execute the script with the correct parameter and other static parameters
    const parameter = `-t "${locationParameters[index].path}"`;
    currentProcess = exec(`${scriptPath} ${parameter} ${staticParams}`);
    console.log(currentProcess.pid);
    // Capture stdout from the child process and send it to the client
    console.log("\nProsess-id:", currentProcess.pid, "\n");
    currentProcess.stdout.on('data', (data) => {
        console.log('stdout:', data);
        res.write(data);
    });

    // Capture stderr from the child process and send it to the client
    currentProcess.stderr.on('data', (data) => {
        console.error('stderr:', data);
        res.write(data);
    });

    // Handle the child process exit event
    currentProcess.on('exit', (code) => {
        console.log('Spoofing stopped successfully.');
        res.end(); // End the response once the process exits
    });
}

function checkProcessRunning(processName, callback) {
    exec(`pgrep -x "${processName}"`, (err, stdout, stderr) => {
        if (err) {
            // Consider the process not running if there's an error
            callback(false);
            return;
        }
        // Process is considered running if stdout is not empty
        if (stdout && stdout.trim() !== '') {
            callback(true);
        }
    });
}

function createLocationFileInTerminal(filename, lat, lng, dur, res) {
    const command = `/home/${username}/gps-sdr-sim/./gps-sdr-sim -e "/home/${username}/gps-sdr-sim/brdc1080.24n" -l ${lat},${lng},100 -b 8 -d ${dur} -o "/home/${username}/gps-sdr-sim/${filename}.bin"`;
    const createProcess = exec(command);

    // Capture stdout from the child process and send it to the client
    createProcess.stdout.on('data', (data) => {
        console.log('stdout:', data);
        res.write(data);
    });

    // Capture stderr from the child process and send it to the client
    createProcess.stderr.on('data', (data) => {
        console.error('stderr:', data);
        res.write(data);
    });

    // Handle the child process exit event
    createProcess.on('exit', (code) => {
        console.log(`Location file ${filename}.bin created successfully.`);
        res.end(); // End the response once the process exits
    });
}

function createMotionLocationFileInTerminal(filename, lat, lng, lat2, lng2, dur, res) {
    const command1 = `/home/${username}/gps-sdr-sim/./gencsv ${dur} ${lat} ${lng} ${lat2} ${lng2}`;
    const createProcess1 = exec(command1);

    // Capture stdout from the child process and send it to the client
    createProcess1.stdout.on('data', (data) => {
        console.log('stdout:', data);
        res.write(data);
    });

    // Capture stderr from the child process and send it to the client
    createProcess1.stderr.on('data', (data) => {
        console.error('stderr:', data);
        res.write(data);
    });

    // Handle the child process exit event
    createProcess1.on('exit', (code) => {
        console.log(`Location file "Trajectory.csv" created successfully.`);
        res.end(); // End the response once the process exits
    });

    const command2 = `/home/${username}/gps-sdr-sim/./gps-sdr-sim -x "/home/${username}/Linuxside/Trajectory.csv" -b 8 -d ${dur} -e "/home/${username}/gps-sdr-sim/brdc1080.24n" -o "/home/${username}/gps-sdr-sim/${filename}.bin"`;
    const createProcess2 = exec(command2);

    // Capture stdout from the child process and send it to the client
    createProcess2.stdout.on('data', (data) => {
        console.log('stdout:', data);
        res.write(data);
    });

    // Capture stderr from the child process and send it to the client
    createProcess2.stderr.on('data', (data) => {
        console.error('stderr:', data);
        res.write(data);
    });

    // Handle the child process exit event
    createProcess2.on('exit', (code) => {
        console.log(`Location file ${filename}.bin created successfully.`);
        res.end(); // End the response once the process exits
    });
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});