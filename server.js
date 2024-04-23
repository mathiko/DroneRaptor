const express = require('express'); 
const app = express(); //
const { exec } = require('child_process'); //New processes are run as child.
const os = require('os'); //Saves info about os, so that username of the pc can be found.
const port = 3000; //Decides what port to run the server on.

let currentProcessSpoof = null;
let currentProcessJam = null;

const username = os.userInfo().username;
const transferCommandSpoof = "/usr/bin/hackrf_transfer -s 2600000 -f 1575420000 -a 0 -x 0";
const transferCommandJam = "/usr/bin/python3";

const locationParameters = [
    { name: 'brotorvet', path: `/home/${username}/gps-sdr-sim/brotorvet.bin` },
    { name: 'kiel', path: `/home/${username}/gps-sdr-sim/kiel.bin` }
];

const jamParameters = [
    { name: `20db`, path: `/home/${username}/gps-sdr-sim/JammerA1X10.py`},
    { name: `30db`, path: `/home/${username}/gps-sdr-sim/JammerA1X20.py`},
    { name: `40db`, path: `/home/${username}/gps-sdr-sim/JammerA1X30.py`},
    { name: `50db`, path: `/home/${username}/gps-sdr-sim/JammerA1X40.py`}
];

app.use(express.json());
app.use(express.static('public'));

app.post('/spoof-file', (req, res) => {
    const { index } = req.body;

    checkProcessRunning("hackrf_transfer", (isRunning) => {
        if (!isRunning) {
            console.log("\nSpoofing started successfully.")
            startTransferSpoof(res, index);
        }
        
        else {
            console.log("Process is already active, press the HackRFone reset-button and try again.");
            res.status(400).send({ message: 'Process is already active, press the HackRFone reset-button and try again.' });
        }
    });
});

app.post("/jam-file", (req, res) => {
    const { index } = req.body;

    checkProcessRunning("python3", (isRunning) => {
        if (!isRunning) {
            console.log("\nJamming started successfully.")
            startTransferJam(res, index);
        }

        else {
            console.log("Process is already active, press the HackRFone reset-button and try again.");
            res.status(400).send({ message: "Process is already active, press the HackRFone reset-button and try again." });
        }
    })
})

app.post('/create-location-file', (req, res) => {
    const { filename, lat, lng, dur } = req.body;
    const newLocation = { name: filename, path: `/home/${username}/gps-sdr-sim/${filename}.bin` };
    locationParameters.push(newLocation);
    createLocationFileInTerminal(filename, lat, lng, dur, res);
});

app.post('/create-motion-location-file', (req, res) => {
    const { filename, lat, lng, lat2, lng2, dur } = req.body;
    const newLocation = { name: filename, path: `/home/${username}/gps-sdr-sim/${filename}.bin` };
    locationParameters.push(newLocation);
    createMotionLocationFileInTerminal(filename, lat, lng, lat2, lng2, dur, res);
});

function startTransferSpoof(res, index) {
    const filename = `-t ${locationParameters[index].path}`;
    currentProcessSpoof = exec(`${transferCommandSpoof} ${filename}`);

    currentProcessSpoof.stdout.on('data', (data) => {
        console.log('stdout:', data);
        res.write(data);
    });

    currentProcessSpoof.stderr.on('data', (data) => {
        console.error('stderr:', data);
        res.write(data);
    });

    currentProcessSpoof.on('exit', (code) => {
        console.log('Spoofing stopped successfully.');
        res.end();
    });
}

function startTransferJam(res, index) {
    const filename = `${jamParameters[index].path}`;
    currentProcessJam = exec(`${transferCommandJam} ${filename}`);

    currentProcessJam.stdout.on('data', (data) => {
        console.log('stdout:', data);
        res.write(data);
    });

    currentProcessJam.stderr.on('data', (data) => {
        console.error('stderr:', data);
        res.write(data);
    });

    currentProcessJam.on('exit', (code) => {
        console.log('Jamming stopped successfully.');
        res.end();
    });
}

function checkProcessRunning(processName, callback) {
    exec(`pgrep -x "${processName}"`, (err, stdout, stderr) => {
        if (err) {
            callback(false);
            return;
        }

        if (stdout && stdout.trim() !== '') {
            callback(true);
        }
    });
}

function createLocationFileInTerminal(filename, lat, lng, dur, res) {
    const command = `/home/${username}/gps-sdr-sim/./gps-sdr-sim -e "/home/${username}/gps-sdr-sim/brdc1080.24n" -l ${lat},${lng},100 -b 8 -d ${dur} -o "/home/${username}/gps-sdr-sim/${filename}.bin"`;
    const createProcess = exec(command);

    createProcess.stdout.on('data', (data) => {
        console.log('stdout:', data);
        res.write(data);
    });

    createProcess.stderr.on('data', (data) => {
        console.error('stderr:', data);
        res.write(data);
    });

    createProcess.on('exit', (code) => {
        console.log(`Location file ${filename}.bin created successfully.`);
        res.end();
    });
}

function createMotionLocationFileInTerminal(filename, lat, lng, lat2, lng2, dur, res) {
    const command1 = `/home/${username}/gps-sdr-sim/./gencsv ${dur} ${lat} ${lng} ${lat2} ${lng2}`;
    const createProcess1 = exec(command1);

    createProcess1.stdout.on('data', (data) => {
        console.log('stdout:', data);
        res.write(data);
    });

    createProcess1.stderr.on('data', (data) => {
        console.error('stderr:', data);
        res.write(data);
    });

    createProcess1.on('exit', (code) => {
        console.log(`Location file "Trajectory.csv" created successfully.`);
        res.end();
    });

    const command2 = `/home/${username}/gps-sdr-sim/./gps-sdr-sim -x "/home/${username}/Linuxside/Trajectory.csv" -b 8 -d ${dur} -e "/home/${username}/gps-sdr-sim/brdc1080.24n" -o "/home/${username}/gps-sdr-sim/${filename}.bin"`;
    const createProcess2 = exec(command2);

    createProcess2.stdout.on('data', (data) => {
        console.log('stdout:', data);
        res.write(data);
    });

    createProcess2.stderr.on('data', (data) => {
        console.error('stderr:', data);
        res.write(data);
    });

    createProcess2.on('exit', (code) => {
        console.log(`Location file ${filename}.bin created successfully.`);
        res.end();
    });
}

app.listen(port, () => {
    console.log(`DroneRaptor application-server is running at http://localhost:${port}`);
});