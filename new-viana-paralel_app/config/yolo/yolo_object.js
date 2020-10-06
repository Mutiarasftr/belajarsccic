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

    init(simulationMode, videoParams, port, keluaran){
        this.simulationMode = simulationMode;
        this.videoParams = videoParams;
        this.port = port;

        if(!this.simulationMode){
            // yolov3 network
            let yoloParams = config.NEURAL_NETWORK_PARAMS[config.NEURAL_NETWORK];
            let videoParams = this.videoParams;

            let darknetCommand = [];
            let initialCommand = ['./darknet','detector','demo', yoloParams.data , yoloParams.cfg, yoloParams.weights]
            let endCommand = ['-ext_output','-dont_show','-json_port','8070', '-mjpeg_port', port, "-keluaran", keluaran];
            //let endCommand = ['-garis','1','-count_static','1', '-mjpeg_port', port, "-dont_show"];

            // darknet
            if(videoParams.indexOf('-c') === 0) {
                darknetCommand = initialCommand.concat(videoParams.split(" ")).concat(endCommand);
            } else {
                darknetCommand = initialCommand.concat(videoParams).concat(endCommand);
            }
            console.log(darknetCommand);

            this.process = new (forever.Monitor)(darknetCommand,{
                max: 1,
                cwd: config.PATH_TO_YOLO_DARKNET,
                killTree: true,
                silent: false,
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
            }
        }
    }

    getPid(){
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(this.process.childData.pid), 2000);
        });
    }
    
}

module.exports = YOLO;

