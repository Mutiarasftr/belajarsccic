const mongoose = require('mongoose');
const io = require('socket.io')(8080);
const rtsp = require('rtsp-ffmpeg');

//model
const Event = require('../models/config/event.model');
const Camera = require('../models/config/camera.model');
const Site = require('../models/config/site.model');

const Face = require('../models/dashboard/face.model');


//event model data
const FaceEvent = require('../models/face_event');
const CumEvent = require('../models/cumulative_event');
const CovidEvent = require('../models/covid_event');

const fs = require('fs-extra');
const path = require('path');
var arr = [];
var arr1;

function delay(camera) {

  for(i=0; i<camera.length; i++){
    if(camera[i].ip.substring(camera[i].ip.length - 4) != 'm3u8'){
      arr.push(camera[i].ip);
    }
  }
  
  arr1 = arr.map(function(uri, i) {
    var stream = new rtsp.FFMpeg({input: uri, resolution: '320x240', quality: 3});
    stream.on('start', function() {
      console.log('stream ' + (i+1) + ' started');
    });
    stream.on('stop', function() {
      console.log('stream ' + (i+1) + ' stopped');
    });
    return stream;
  });

  
  arr1.forEach(function(camStream, i) {
    var ns = io.of('/cam' + (i+1));
    ns.on('connection', function(wsocket) {
      console.log('connected to /cam' + (i+1));
      var pipeStream = function(data) {
        wsocket.emit('data', data);
      };
      camStream.on('data', pipeStream);
      
      wsocket.on('disconnect', function() {
        console.log('disconnected from /cam' + (i+1));
        camStream.removeListener('data', pipeStream);
      });
    });
  });

}

module.exports = {
    viewHome: async (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};

            const site = await Site.countDocuments({});

            const camera = await Camera.aggregate([
                {
                    '$project': {
                      'status': 1, 
                      'active': {
                        '$cond': [
                          {
                            '$eq': [
                              '$status', 'active'
                            ]
                          }, 1, 0
                        ]
                      }, 
                      'inactive': {
                        '$cond': [
                          {
                            '$eq': [
                              '$status', 'inactive'
                            ]
                          }, 1, 0
                        ]
                      }
                    }
                  }, {
                    '$group': {
                      '_id': 'status', 
                      'countActive': {
                        '$sum': '$active'
                      }, 
                      'countInactive': {
                        '$sum': '$inactive'
                      }
                    }
                }
            ]);

            const events = await Event.aggregate([
                {
                    '$project': {
                      'process': 1, 
                      'active': {
                        '$cond': [
                          {
                            '$eq': [
                              '$process', true
                            ]
                          }, 1, 0
                        ]
                      }, 
                      'inactive': {
                        '$cond': [
                          {
                            '$eq': [
                              '$process', false
                            ]
                          }, 1, 0
                        ]
                      }
                    }
                  }, {
                    '$group': {
                      '_id': 'process', 
                      'countActive': {
                        '$sum': '$active'
                      }, 
                      'countInactive': {
                        '$sum': '$inactive'
                      }
                    }
                }
            ]);

            console.log(camera);

            res.render('dashboard/home/view_home', {
                title: 'Viana | Home',
                alert,
                page: 'Home',
                action: '',
                countCamera: camera,
                countEvent: events,
                countSite: site
            });
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/home');
        }
    },

    viewCCTV: async (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('dashboard/cctv/view_cctv', {
                title: 'Viana | CCTV',
                alert,
                page: 'CCTV',
                action: 'view',
                cek: 'hello, world',
                count: 0,
                data_event_cum: 0,
                data_event_covid: 0
            });
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/cctv');
        }
    },
    cctvProcess: async (req, res) => {
        try {
            const camera = await Camera.find()
                .populate({
                    path: 'eventId',
                    match: {process: true},
                    populate: {
                        path: 'analyticId',
                        select: 'name'
                    }
                })
                .populate('siteId');

                delay(camera);
            
            res.status(200).send(camera);
        } catch (error) {
            res.status(400).send(error);
        }
    },
    cctvDetail: async (req, res) => {
        try {
            let ambil = [];
            let data_event = {};
            let data_event_cum = {};
            let data_event_covid = {};
            let jml_face = {};
            let data_jml_face = {known:0, unknown:0};

            const {id} = req.params;
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            const camera = await Camera.find({_id: id})
                .populate({
                    path: 'eventId',
                    match: {process: true},
                    populate: {
                        path: 'analyticId',
                        select: 'name slug'
                    }
                })
                .populate('siteId');
            
            //dari kamera yang dilihat detailnya, ambil setiap event yang pakai kamera tsb
            //kalau ada lebih atau hanya 1, cek analytic apa yang pakai kamera tsb
            //lalu ambil datanya dari collections analytic yang sesuai
            if(camera[0].eventId.length >= 1){
                for(i=0; i<camera[0].eventId.length; i++){
                    ambil[i] = camera[0].eventId[i].analyticId.slug;
                    if(camera[0].eventId[i].analyticId.name == 'Face Recognition'){
                        var utc = new Date().toJSON().slice(0,10);
                        
                        //mengambil data face untuk hari ini baik yang known atau unknown
                        data_event = await FaceEvent.aggregate([
                            {
                                "$match": {
                                    "event.eventId": new mongoose.mongo.ObjectId(camera[0].eventId[i].id)
                                }
                            },{
                                "$unwind": "$face"
                            }, {
                                '$project': {
                                  'eventId': '$eventId', 
                                  'face': '$face', 
                                  'date': {
                                    '$dateFromString': {
                                      'dateString': '$face.date'
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
                                    "face.date": -1
                                }
                            },
                            { $limit : 8 }
                        ]);
                        

                        //menghitung jumlah face untuk hari ini terdeteksi baik yang known atau unknown
                        jml_face = await FaceEvent.aggregate([
                            {
                                "$match": {
                                    "event.eventId": new mongoose.mongo.ObjectId(camera[0].eventId[i].id)
                                }
                            },{
                                '$unwind': {
                                  'path': '$face'
                                }
                              }, {
                                '$project': {
                                  'eventId': '$eventId', 
                                  'face': '$face', 
                                  'date': {
                                    '$dateFromString': {
                                      'dateString': '$face.date'
                                    }
                                  }
                                }
                              }, {
                                '$match': {
                                  'date': {
                                    '$gte': new Date(utc)
                                  },
                                }
                              }, {
                                '$group': {
                                  '_id': {
                                    "class": "$face.class"
                                  }, 
                                  'count': {
                                    '$sum': 1
                                  }
                                }
                              }
                        ]);

                        //menghitung kelas yg known dan unknown
                        for(let i=0; i<jml_face.length; i++){
                            if(jml_face[i]._id.class === 'unknown'){
                                data_jml_face['unknown'] += jml_face[i].count;
                            }else{
                                data_jml_face['known'] += jml_face[i].count;
                            }
                        }
                        
                    }else if(camera[0].eventId[i].analyticId.name == 'Cumulative Counting'){
                        var utc = new Date().toJSON().slice(0,10);

                        global.eventId_cum = camera[0].eventId[i].id;

                        data_event_cum = await CumEvent.aggregate([
                            {
                                "$match": {
                                  "event.eventId": new mongoose.mongo.ObjectId(camera[0].eventId[i].id)
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
                    }else if(camera[0].eventId[i].analyticId.name == 'Social Distancing'){
                        var utc = new Date().toJSON().slice(0,10);

                        global.eventId_cvd = camera[0].eventId[i].id;

                        //mengambil data social distancing sort berdasarkan waktu terbaru
                        data_event_covid = await CovidEvent.aggregate([
                            {
                                "$match": {
                                    "event.eventId": new mongoose.mongo.ObjectId(camera[0].eventId[i].id)
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

                        // console.log(data_event_covid);
                    }else if(camera[0].eventId[i].analyticId.name == 'Object Detection'){

                    }
                }
            }

            res.render('dashboard/cctv/view_cctv', {
                title: 'Viana | Detail CCTV',
                action: 'detail',
                camera,
                alert,
                page: 'CCTV Detail',
                cek: ambil,
                count: camera[0].eventId.length ,
                data_event: data_event,
                data_jml_face: data_jml_face,
                data_event_cum: data_event_cum,
                data_event_covid: data_event_covid
            });
        } catch (error) {
            res.status(400).send(error);
        }
    },

    // Feature Face Recognition known 
    viewFaceRecognition: async (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('dashboard/feature/face-recognition/view_face_recognition', {
                title: 'Viana | Face Recognition',
                alert,
                page: 'Face Recognition',
                action: ''
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/face-recognition');
        }
    },

    // Feature Face Enrollment
    viewFaceEnrollment: async (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            const face = await Face.find();
            res.render('dashboard/feature/face-enrollment/view_face_enrollment', {
                title: 'Viana | Face Enrollment',
                alert,
                page: 'Face Enrollment',
                action: 'view',
                face
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/face-enrollment');
        }
    },
    addFaceEnrollment: async (req, res) => {
        try {
            const {name, id_tag, gender, birth_date, nationality, status} = req.body;
            await Face.create({
                name,
                id_tag,
                gender,
                birth_date,
                nationality,
                status,
                image: `images/face-enrollment/${req.file.filename}`
            });
            req.flash('alertMessage', 'Success Add Face');
            req.flash('alertStatus', 'success'); 
            //res.redirect('/dashboard/face-enrollment');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/face-enrollment');
        }
    },
    showEditFaceEnrollment: async (req, res) => {
        try {
            const {id} = req.params;
            const face = await Face.findOne({_id: id});
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('dashboard/feature/face-enrollment/view_face_enrollment', {
                title: 'Viana | Edit Face Enrollment',
                face,
                alert,
                action: 'edit',
                page: 'Face Enrollment'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/face-enrollment');
        }
    },
    editFaceEnrollment: async (req, res) => {
        try {
            const {id} = req.params;
            const {name, id_tag, gender, birth_date, nationality, status} = req.body;
            const face = await Face.findOne({_id: id});
            //kalau tidak upload foto
            if(req.file == undefined){
                face.name = name;
                face.id_tag = id_tag;
                face.gender = gender;
                face.birth_date = birth_date;
                face.nationality = nationality;
                face.status = status;
                await face.save();
                req.flash('alertMessage', 'Success Update Face Enrollment');
                req.flash('alertStatus', 'success'); 
                res.redirect('/dashboard/face-enrollment');
            }else{
                fs.unlink(path.join(`public/${face.image}`));
                face.name = name;
                face.id_tag = id_tag;
                face.gender = gender;
                face.birth_date = birth_date;
                face.nationality = nationality;
                face.status = status;
                face.image = `images/${req.file.filename}`
                await face.save();
                req.flash('alertMessage', 'Success Update Face Enrollment');
                req.flash('alertStatus', 'success'); 
                res.redirect('/dashboard/face-enrollment');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/face-enrollment');
        }
    },
    deleteFaceEnrollment: async (req, res) => {
        try {
            const {id} = req.params;
            const face = await Face.findOne({_id: id});
            await fs.unlink(path.join(`public/${face.image}`));
            await face.remove();
            req.flash('alertMessage', 'Success Delete Face Enrollment');
            req.flash('alertStatus', 'success'); 
            res.redirect('/dashboard/face-enrollment');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/face-enrollment');
        }
    },
    loading: async (req, res) => {
        res.render('dashboard/feature/face-enrollment/view_loading', {
            title: 'Viana | Edit Face Enrollment',
            page: 'Face Enrollment',
            action: 'loading'
        });
    },

    viewMaps: async (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('dashboard/maps/view_maps', {
                title: 'Viana | Maps',
                alert,
                page: 'Maps',
                action: ''
            });
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/maps');
        }
    },
    getMaps: async (req, res) => {
        try {
            const camera = await Camera.find();

            res.status(200).send(camera);
        } catch (error) {
            res.status(400).send(camera);
        }
    },
    viewCameraById: async (req, res) => {
        try {
            const {id} = req.params;
            const camera = await Camera.findById(id)
            .populate({
                path: 'eventId',
                match: {process: true},
                populate: {
                    path: 'analyticId',
                    select: 'name'
                }
            });
            res.status(200).send(camera);
        } catch (error) {
            res.status(400).send(error);
        }
    },

    viewHistory: async (req, res) => {
        try {
            //mengambil data wajah yang terdeteksi dan diketahui
            const face_known = await FaceEvent.aggregate([
                {
                    '$unwind': {
                        'path': '$face'
                }
                }, {
                    '$match': {
                        'face.class': {
                        '$ne': 'unknown'
                    }
                }
                }, {
                    '$sort': {
                        'face.date': -1
                    }
                }
            ]);
            await FaceEvent.populate(face_known, [{ path: 'eventId', populate: { path: 'cameraId' }}]);

            //mengambil wajah yang terdeteksi tetapi tidak diketahui
            const face_unknown = await FaceEvent.aggregate([
                {
                    '$unwind': {
                        'path': '$face'
                }
                }, {
                    '$match': {
                        'face.class':  'unknown'
                }
                }, {
                    '$sort': {
                        'face.date': -1
                    }
                }
            ]);
            await FaceEvent.populate(face_unknown, [{ path: 'eventId', populate: { path: 'cameraId' }}]);

            //console.log(face_known);
            console.log(face_unknown);

            const cum_event = await CumEvent.aggregate([
            {
                "$unwind": "$count"
            }, {
                "$sort": {
                    "count.date": -1
                }
            }]);
            await CumEvent.populate(cum_event, [{ path: 'eventId', populate: { path: 'cameraId' }}]);

            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('dashboard/history/view_history', {
                title: 'Viana | Event History',
                alert,
                page: 'History',
                face_known: face_known,
                face_unknown: face_unknown,
                cum_event: cum_event,
                action: ''
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/dashboard/history');
        }
    }
}