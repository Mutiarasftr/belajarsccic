const fs = require('fs');
const faker = require('faker');
const watch = require('node-watch');

const mongoose = require('mongoose');

//model
const FaceEvent = require('../../models/face_event');
const CumEvent = require('../../models/cumulative_event');
const CovidEvent = require('../../models/covid_event');
const ObjectEvent = require('../../models/object_event');

function isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
}

function getFileReadPromise(file){
	return new Promise((resolve, reject)=>{
		fs.readFile(file, function(err, data){
            if(err) reject(err);
            if(!isEmptyObject(data)){
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    return false;
                }
            }
		})
	});
}

module.exports = function(io){
    //socket object counting real time
    const chart = io.of('/object');
    chart.on('connection', (socket) => {
        var filter = [{
            $project: {
                "fullDocument.object": {
                    $arrayElemAt: ["$fullDocument.object", -1]
                },
            }
        }];

        var options = { fullDocument: 'updateLookup' };
        
        const changeStream = ObjectEvent.watch(filter, options);

        //watcher untuk ada perubahan pada collection face di database sehingga bisa realtime
        changeStream.on('change', (change) => {
            //console.log(change); // You could parse out the needed info and send only that data. 
            socket.emit('object', change.fullDocument.object);
        }); 
      
        socket.on('disconnect', function(){
          changeStream.close();
        });
    });

    //socket cumulative counting
    const count = io.of('/counting');
    count.on('connection', (socket) => {
        interval = setInterval(async function(){
            try {
                var utc = new Date().toJSON().slice(0,10);
                const object = await CumEvent.aggregate([
                    {
                        "$match": {
                          "event.eventId": new mongoose.mongo.ObjectId(eventId_cum)
                        }
                    },{
                      "$unwind": {
                        "path": "$count"
                      }
                    }, {
                      "$unwind": {
                        "path": "$count.res"
                      }
                    }, {
                      "$unwind": {
                        "path": "$count.res.data"
                      }
                    }, {
                      "$match": {
                        "count.date": {
                          "$gte": new Date(utc)
                        }, 
                        "count.res.data": {
                          "$exists": true
                        }
                      }
                    }, {
                      "$group": {
                        "_id": 
                          "$count.res.data.object"
                        , 
                        "value": {
                          "$sum": "$count.res.data.count"
                        }
                      }
                    }
                ]);
                console.log(object);
                socket.emit('count', object);
            } catch (error) {
                console.log(error);
            }
            
            
        }, 10000);

        socket.on('disconnect', function(){
            clearInterval(interval);
            console.log("disconnected!");
        });
    });

    //socket face recognition
    const face = io.of('/face');
    face.on('connection', (socket) =>{
        var filter = [{
            $project: {
                "fullDocument.face": {
                    $arrayElemAt: ["$fullDocument.face", -1]
                },
            }
        }];

        var options = { fullDocument: 'updateLookup' };
        
        const changeStream = FaceEvent.watch(filter, options);

        //watcher untuk ada perubahan pada collection face di database sehingga bisa realtime
        changeStream.on('change', (change) => {
            console.log(change); // You could parse out the needed info and send only that data. 
            socket.emit('face-info', change.fullDocument.face);
        }); 
      
        socket.on('disconnect', function(){
          changeStream.close();
        });
    });

    //socket covid social distancing
    const covid = io.of('/covid');
    covid.on('connection', (socket) => {
        interval = setInterval(async function(){
            try {
                var utc = new Date().toJSON().slice(0,10);
                const object = await CovidEvent.aggregate([
                    {
                        "$match": {
                            "event.eventId": new mongoose.mongo.ObjectId(eventId_cvd)
                        }
                    },{
                        "$unwind": "$covid"
                    }, {
                        '$project': {
                        'eventId': '$eventId', 
                        'covid': '$covid', 
                        'date': {
                            '$dateFromString': {
                            'dateString': '$covid.date'
                            }
                        }
                        }
                    }, {
                        '$match': {
                        'date': {
                            '$gte': new Date(utc)
                        }
                        }
                    }, {
                        "$sort": {
                            "covid.date": -1
                        }
                    },
                    { $limit : 1 }
                ]);
                socket.emit('covid', object);
            } catch (error) {
                console.log(error);
            }
            
        }, 2000);
    
        socket.on('disconnect', function(){
            clearInterval(interval);
            console.log("disconnected!");
        });
    });
}

