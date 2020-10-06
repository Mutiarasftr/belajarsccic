const forever = require('forever-monitor');
const config = require('../configuration');
var fs = require('fs');

class YOLO{
    constructor() {
        this.isStarting = false
        this.isStarted = false
        this.isInitialized =false
        this.process = null
        this.simulationMode = false
        this.simulationMJPEGServer = null
        this.simulationJSONHTTPStreamServer = null
    }

    init(simulationMode, videoParams, port, transId, camera_name){
        this.simulationMode = simulationMode;
        this.videoParams = videoParams;
        this.port = port;
        this.transId = transId;
        this.camera_name = camera_name;

        if(!this.simulationMode){
            // yolov3 network
            let videoParams = this.videoParams;

            let darknetCommand = [];
            let initialCommand = ['/home/hadoop/.virtualenvs/dl/bin/python','webobjectdetection.py']
            let endCommand = ['--ip', "0.0.0.0", '--port', port, '--cam', videoParams, '--transid', transId, '--name_camera', camera_name];

            darknetCommand = initialCommand.concat(endCommand);

            this.process = new (forever.Monitor)(darknetCommand,{
                max: 1,
                cwd: config.PATH_TO_PYTHON_SOCIAL_DISTANCING,
                killTree: true,
                silent: false,
                args: ['--killSignal=SIGTERM']
            });
        
            this.process.on("start", () => {
                console.log('Process YOLO started');
                this.isStarted = true;
                this.isStarting = false;
            });
    
            this.process.on("stop", () => {
                console.log('Process YOLO stopped');
                this.isStarted = false;
            });
    
            this.process.on("restart", () => {
                // Forever 
                console.log("Restart YOLO");
            })
    
            this.process.on("error", (err) => {
                console.log('Process YOLO error');
                console.log(err);
            });
    
            this.process.on("exit", (err) => {
                console.log('Process YOLO exit');
                console.log(err);
            });

        }

        //console.log('Process YOLO initialized');
        this.isInitialized = true;

        return new Promise((resolve, reject) => {
            setTimeout(() => resolve("Process YOLO initialized!"), 2000);
        });
    }

    start(){
        // Do not start it twice
        if(this.isStarted || this.isStarting) {
            console.log('already started');
            return;
        }
        
        this.isStarting = true;
        
        if(this.simulationMode) {
            setTimeout(() => {
                // Simulate 5s to start yolo
                this.startYOLOSimulation();
            }, 5000);
        } else {
            if(!this.isStarted) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => resolve(this.process.start()), 3000);
                });
                //this.process.start();
            }
        }
    }

    stop(){
        // TODO LATER add a isStopping state
        if(this.simulationMode && this.simulationServer) {
            this.simulationServer.kill(function () {
                this.isStarted = false;
            });
        } else {
            if(this.isStarted) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => resolve(this.process.stop()), 5000);
                });
                //this.process.stop();
            }
        }
    }

    getPid(){
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(this.process.childData.pid), 2000);
        });
        //return this.process.childData.pid;
    }
    
}

module.exports = YOLO;