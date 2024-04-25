const express = require('express'); //Imports the express-framework.
const app = express(); //Creates an instance of an express-application.
const { exec } = require('child_process'); //Imports the execute function from the node.js "child-process"-module so that new processes are run as child-processes.
const os = require('os'); //Import os-module so that info about the os can be found, such as username of the pc.
const port = 3000; //Decides what port to run the server on.

let currentProcessSpoof = null; //Variable to store the spoof-process.
let currentProcessJam = null; //Variable to store the jam-process.

//Uses the os-module to save the username of the machine running the server.
const username = os.userInfo().username;
//Variable holding the spoofing command and its static parameters.
const transferCommandSpoof = "/usr/bin/hackrf_transfer -d 0000000000000000223c69dc277f684f -s 2600000 -f 1575420000 -a 0 -x 0";
//Variable holding the jamming command.
const transferCommandJam = "/usr/bin/python3";

//List that stores all locations and their respective filepaths and names.
const locationParameters = [
    { name: 'brotorvet', path: `/home/${username}/gps-sdr-sim/brotorvet.bin` },
    { name: 'kiel', path: `/home/${username}/gps-sdr-sim/kiel.bin` }
];

//List that stores all the Jammer-files and their respective filepaths and names.
const jamParameters = [
    { name: `20db`, path: `/home/${username}/gps-sdr-sim/JammerA1X10.py`},
    { name: `30db`, path: `/home/${username}/gps-sdr-sim/JammerA1X20.py`},
    { name: `40db`, path: `/home/${username}/gps-sdr-sim/JammerA1X30.py`},
    { name: `50db`, path: `/home/${username}/gps-sdr-sim/JammerA1X40.py`}
];

app.use(express.json()); // Enables the server to work with data sent in JSON format in HTTP-requests.
app.use(express.static('public')); //Allows express to serve all files located in the "public" directory (index, script, styles, images). The server won't serve any other files to the webclient.

//Endpoint for the webclient script to request spoofing via POST http-requests.
app.post('/spoof-request', (req, res) => { //req is the info of the request from the webclient, and the res is the respond sent back from the server (here) to the webclient again.
    const index = req.body.index; //Variable to save the index sent from the webclient.

    //Runs the checkprocess function to check if any process with the name "hackrf_transfer" is already running.
    checkProcessRunning("hackrf_transfer", (isRunning) => {
        //If there is not already an instance of the process, we start the spoofing-process.
        if (!isRunning) {
            console.log("\nSpoofing started successfully.")
            startTransferSpoof(res, index);
        }
        
        //If there is already an instance, we give an error and don't start a new one.
        else {
            console.log("Process is already active.");
            res.send("Process is already active.");
        }
    });
});


app.post("/jam-request", (req, res) => {
    const index = req.body.index;

    checkProcessRunning("python3", (isRunning) => {
        if (!isRunning) {
            console.log("\nJamming started successfully.")
            startTransferJam(res, index);
        }

        else {
            console.log("Process is already active.");
            res.send("Process is already active.");
        }
    })
});

//Endpoint for the webclient script to request stop of spoofing via POST http-requests.
app.post("/stop-spoof-request", (req, res) => {
    //Ensures that there is indeed a spoofing process running already.
    checkProcessRunning("hackrf_transfer", (isRunning) => {
        if (isRunning) {
            //Runs stop spoofing function if process is running.
            stopSpoof();
        }
        
        //If there is no process running, we write it to the console.
        else {
            console.log("No spoofing-process is running.");
            res.status(400).send("Nothin special;)"); //Sends an error 400 message if the process is not running, so that the !response.ok is true in the webclient, and therefore lets it display errormessage on the screen.
        }
    });
});

app.post("/stop-jam-request", (req, res) => {
    checkProcessRunning("python3", (isRunning) => {
        if (isRunning) {
            stopJam();
        }

        else {
            console.log("No jamming-process is running.");
            res.status(400).send("Nothin special;)");
        }
    })
});

//Creates an endpoint for the webclient to request the server to create a new location-file.
app.post('/create-location-file', (req, res) => {
    //This declares all variables at once, and the req.body knows where to append which value received from the webclient because the names match.
    const { filename, lat, lng, dur } = req.body;
    //Creates a new location to add to the locations-list with the new file's name and path.
    const newLocation = { name: filename, path: `/home/${username}/gps-sdr-sim/${filename}.bin` };
    //Pushes the new location to the location-list.
    locationParameters.push(newLocation);
    //Calls the function to create a new file with all the parameters received from the webclient.
    createLocationFileInTerminal(filename, lat, lng, dur, res);
});

app.post('/create-motion-location-file', (req, res) => {
    const { filename, lat, lng, lat2, lng2, dur } = req.body;
    const newLocation = { name: filename, path: `/home/${username}/gps-sdr-sim/${filename}.bin` };
    locationParameters.push(newLocation);
    createMotionLocationFileInTerminal(filename, lat, lng, lat2, lng2, dur, res);
});

//This is the function that executes the command to start the spoofing-process.
function startTransferSpoof(res, index) {
    //This is a none-static parameter since the path relies on what location is being spoofed to, and is therefore not added to the transferCommandSpoof-variable. The index of the location is passed to the function, and the path of the location placed at that index is saved in filename.
    const filename = `-t ${locationParameters[index].path}`;
    //Saves and runs the process in a variable so it can be accessed.
    currentProcessSpoof = exec(`${transferCommandSpoof} ${filename}`);

    //This runs an eventlistener to the stdout-function on the "currentProcessSpoof" called "data". This "data"-function checks whenever new data is available from stdout, and when there is new data, it runs the callback function "(data) => {console.log(data);", which prints that data to the console.
    currentProcessSpoof.stdout.on('data', (data) => {
        console.log(data);
    });

    //Same as with stdout, but this checks for errors.
    currentProcessSpoof.stderr.on('data', (data) => {
        console.log('stderr:', data);
    });

    //Does the same as the two previous ones, except this uses the "exit"-function instead. The exit-function checks whenever the process exits, and then it runs the callback to print an exit message in console.
    currentProcessSpoof.on('exit', () => {
        console.log('Spoofing stopped successfully.');
        //Sends an exit-response to the http-request.
        res.end();
    });
}

function startTransferJam(res, index) {
    const filename = `${jamParameters[index].path}`;
    currentProcessJam = exec(`${transferCommandJam} ${filename}`);

    currentProcessJam.stdout.on('data', (data) => {
        console.log(data);
    });

    currentProcessJam.stderr.on('data', (data) => {
        console.log('stderr:', data);
    });

    currentProcessJam.on('exit', () => {
        console.log('Jamming stopped successfully.');
        res.end();
    });
}

//Function that runs a command in terminal to kill the "hackrf_transfer"-process.
function stopSpoof(res) {
    exec("pkill -SIGINT hackrf_transfer");
}

//Function that sends nextline to the jamming-process, as it is an inbuilt function in the jamming program to stop the jamming-process.
function stopJam() {
    currentProcessJam.stdin.write("\n");
}

//This is the function that checks if a process with a specific name is running. It takes in the name of the process we want to check, as well as a callback function that will be set to return true or false.
function checkProcessRunning(processName, callback) {
    //This runs a childprocess with the "pgrep" process that greps processes, and it uses the x parameter which searches for process-names. If there is any error, it is saved in "err", and it indicates that the process we searched for is not running. The potential output if the process is running, is stored in stdout.
    exec(`pgrep -x "${processName}"`, (err, stdout) => {
        //If err is still null, this statement is false and will not be ran. However if err is not null, there was an errorm which tells us the process is not running. We then send callback(false), which gives the same function as returning false from a normal function.
        if (err) {
            callback(false);
            return;
        }
        
        //If there was no error and the stdout is not null, we grep-ed the process name, which tells us the process is running. We then send the callback(true) to tell that the process is running.
        else if (stdout != '') {
            callback(true);
        }
    });
}

function createLocationFileInTerminal(filename, lat, lng, dur, res) {
    const command = `/home/${username}/gps-sdr-sim/./gps-sdr-sim -e "/home/${username}/gps-sdr-sim/brdc1140.24n" -l ${lat},${lng},100 -b 8 -d ${dur} -o "/home/${username}/gps-sdr-sim/${filename}.bin"`;
    const createProcess = exec(command);

    createProcess.stdout.on('data', (data) => {
        console.log(data);
    });

    createProcess.stderr.on('data', (data) => {
        console.log('stderr:', data);
    });

    createProcess.on('exit', () => {
        console.log(`Location file ${filename}.bin created successfully.`);
        res.end();
    });
}

function createMotionLocationFileInTerminal(filename, lat, lng, lat2, lng2, dur, res) {
    const command1 = `/home/${username}/gps-sdr-sim/./gencsv ${dur} ${lat} ${lng} ${lat2} ${lng2}`;
    const createProcess1 = exec(command1);

    createProcess1.stdout.on('data', (data) => {
        console.log(data);
    });

    createProcess1.stderr.on('data', (data) => {
        console.log('stderr:', data);
    });

    createProcess1.on('exit', () => {
        console.log(`Location file "Trajectory.csv" created successfully.`);
        res.end();
    });

    const command2 = `/home/${username}/gps-sdr-sim/./gps-sdr-sim -x "/home/${username}/DroneRaptor/Trajectory.csv" -b 8 -d ${dur} -e "/home/${username}/gps-sdr-sim/brdc1140.24n" -o "/home/${username}/gps-sdr-sim/${filename}.bin"`;
    const createProcess2 = exec(command2);

    createProcess2.stdout.on('data', (data) => {
        console.log(data);
    });

    createProcess2.stderr.on('data', (data) => {
        console.log('stderr:', data);
    });

    createProcess2.on('exit', () => {
        console.log(`Location file ${filename}.bin created successfully.`);
        res.end();
    });
}

//This tells the server to listen for connections on the specified port (3000). Without this, we wouldnt be able to access the server via any webclients. For example, localhost:3000 in a webbrowser wouldnt work, and we would therefore not be able to use any of the server's html or javascript functions. 
app.listen(port, () => {
    //Prints a startup-message when the server is running and ready to receive connections.
    console.log(`DroneRaptor application-server is running at http://localhost:${port}`);
});
