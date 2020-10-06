const Site = require('../models/config/site.model');
const Analytic = require('../models/config/analytic.model');
const Camera = require('../models/config/camera.model');
const Event = require('../models/config/event.model');

const SIMULATION_MODE = false;

//analytic
const Face = require('../config/yolo/yolo_face');
const ObjectD = require('../config/yolo/yolo_object');
const Counting = require('../config/yolo/yolo_cumulative');
const Covid = require('../config/yolo/yolo_social_distancing');

//model event untuk menyimpan data
const FaceEvent = require('../models/face_event');
const CumEvent = require('../models/cumulative_event');
const CovidEvent = require('../models/covid_event');
const ObjectEvent = require('../models/object_event');

module.exports = {
    //site
    viewSite: async (req, res) => {
        try {
            const site = await Site.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('config/site/view_site', {
                title: 'Viana | Site',
                alert,
                site,
                page: 'Site'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/site');
        }
        
    },
    addSite: async (req, res) => {
        try {
            const {name, description, city, location} = req.body;
            await Site.create({
                name,
                description,
                city,
                location
            });
            req.flash('alertMessage', 'Success add site');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/site');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/site');
        }
    },
    editSite: async (req, res) => {
        try {
            const {id, name, description, city, location} = req.body;
            const new_site = await Site.findOne({_id: id});
            new_site.name = name;
            new_site.description = description;
            new_site.city = city;
            new_site.location = location;
            await new_site.save();
            req.flash('alertMessage', 'Success update site');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/site');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/site');
        }
    },
    deleteSite: async (req, res) => {
        try {
            const {id} = req.params;
            const site = await Site.findOne({_id: id});
            if(site.cameraId.length != 0){
                req.flash('alertMessage', 'Cannot delete site, document is used in camera');
                req.flash('alertStatus', 'danger'); 
                res.redirect('/configuration/site');
            }else{
                await site.remove();
                req.flash('alertMessage', 'Success delete site');
                req.flash('alertStatus', 'success'); 
                res.redirect('/configuration/site');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/site');
        }
    },
    siteById: async (req, res) => {
        try {
            const {id} = req.params;
            const site = await Site.findById(id).populate({
                path: 'cameraId',
                match: {status: 'active'}
            });
            res.status(200).send(site);
        } catch (error) {
            res.status(400).send(error);
        }
    },

    //camera
    viewCamera: async (req, res) => {
        try {
            const camera = await Camera.find()
                .populate({path: 'siteId', select: 'id name'});
            const site = await Site.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('config/camera/view_camera', {
                title: 'Viana | Camera',
                camera,
                site,
                alert,
                action: 'view',
                page: 'Camera'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/camera');
        }
    },
    addCamera: async (req, res) => {
        try {
            const {name, brand, latitude, longitude, address, ip, protocol, status, siteId, xcoor, ycoor} = req.body;
            const site = await Site.findOne({_id: siteId});
            const newCamera = {
                name,
                brand,
                location: {
                    latitude,
                    longitude
                },
                address,
                protocol,
                ip,
                status,
                siteId: site._id,
                vector: {
                    transform: `translate(${xcoor}, ${ycoor}) scale(0.25, 0.25)`
                }
            };
            const Ocamera = await Camera.create(newCamera);
            site.cameraId.push({_id: Ocamera._id});
            await site.save();
            req.flash('alertMessage', 'Success add camera');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/camera');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/camera');
        }
    },
    showEditCamera: async (req, res) => {
        try {
            const {id} = req.params;
            const camera = await Camera.findOne({_id: id})
                .populate({path: 'siteId', select: 'id name'});
            const site = await Site.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('config/camera/view_camera', {
                title: 'Viana | Camera',
                camera,
                site,
                alert,
                action: 'edit',
                page: 'Camera'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/camera');
        }
    },
    editCamera: async (req, res) => {
        try {
            const {id} = req.params;
            const {name, brand, latitude, longitude, address, ip, protocol, status, siteId} = req.body;
            const new_camera = await Camera.findOne({_id: id})
                .populate({path: 'siteId', select: 'id site'});

            //hapus camera di site yang lama
            const old_site = await Site.findOne({_id: new_camera.siteId.id});
            old_site.cameraId.pull(id);
            await old_site.save();

            //simpan kamera ke site baru
            const new_site = await Site.findOne({_id: siteId});
            new_site.cameraId.push({_id: id});
            await new_site.save();

            new_camera.name = name;
            new_camera.brand = brand;
            new_camera.location.latitude = latitude;
            new_camera.location.longitude = longitude;
            new_camera.address = address;
            new_camera.protocol = protocol;
            new_camera.ip = ip;
            new_camera.status = status;
            new_camera.siteId = siteId;
            await new_camera.save();
            req.flash('alertMessage', 'Success update camera');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/camera');
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/camera');
        }
    },
    deleteCamera: async (req, res) => {
        try {
            const {id} = req.params;
            const camera = await Camera.findOne({_id: id}).populate('siteId');
            if(camera.eventId.length != 0){
                req.flash('alertMessage', 'Cannot delete camera, camera is used');
                req.flash('alertStatus', 'danger'); 
                res.redirect('/configuration/camera');
            }else{
                const site = await Site.findOne({_id: camera.siteId.id}).then((data) => {
                    data.cameraId.pull(id);
                    data.save();
                }).catch((error) => {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger'); 
                    res.redirect('/configuration/camera');
                });
                await camera.remove();
                req.flash('alertMessage', 'Success delete camera');
                req.flash('alertStatus', 'success'); 
                res.redirect('/configuration/camera');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/camera');
        }
    },
    
    //analytic
    viewAnalytic: async (req, res) => {
        try {
            const analytic = await Analytic.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('config/analytic/view_analytic', {
                title: 'Viana | Analytic',
                analytic,
                alert,
                page: 'Analytic'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/site');
        }
    },
    addAnalytic: async (req, res) => {
        try {   
            const {name} = req.body;
            await Analytic.create({
                name,
            });
            req.flash('alertMessage', 'Success add analytic');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/analytic');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/analytic');
        }
    },
    editAnalytic: async (req, res) => {
        try {
            const {id, name} = req.body;
            const analytic = await Analytic.findOne({_id: id});
            analytic.name = name;
            await analytic.save();
            req.flash('alertMessage', 'Success update analytic');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/analytic');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/analytic');
        }
    },
    deleteAnalytic: async (req, res) => {
        try {
            const {id} = req.params;
            const analytic = Analytic.findOne({_id: id});
            await analytic.remove();
            req.flash('alertMessage', 'Success delete analytic');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/analytic');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/analytic');
        }
    },

    //parameter
    viewParameter: async (req, res) => {
        try {
            const parameter = await parameter.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('config/parameter/view_parameter', {
                title: 'Viana | parameter',
                alert,
                parameter,
                page: 'Parameter'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/parameter');
        }
        
    },
    addParameter: async (req, res) => {
        try {
            const {name, value} = req.body;
            await Parameter.create({
                name,
                value,
            });
            req.flash('alertMessage', 'Success add site');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/parameter');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/parameter');
        }
    },
    editParameter: async (req, res) => {
        try {
            const {id, name, value} = req.body;
            const new_parameter = await Parameter.findOne({_id: id});
            new_parameter.name = name;
            new_parameter.value = value;
            await new_parameter.save();
            req.flash('alertMessage', 'Success update parameter');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/parameter');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/parameter');
        }
    },
    deleteParameter: async (req, res) => {
        try {
            const {id} = req.params;
            const site = await Parameter.findOne({_id: id});
            if(site.cameraId.length != 0){
                req.flash('alertMessage', 'Cannot delete site, document is used in camera');
                req.flash('alertStatus', 'danger'); 
                res.redirect('/configuration/site');
            }else{
                await parameter.remove();
                req.flash('alertMessage', 'Success delete parameter');
                req.flash('alertStatus', 'success'); 
                res.redirect('/configuration/parameter');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/parameter');
        }
    },
    parameterById: async (req, res) => {
        try {
            const {id} = req.params;
            const parameter = await Parameter.findById(id).populate({
                path: 'cameraId',
                match: {status: 'active'}
            });
            res.status(200).send(parameter);
        } catch (error) {
            res.status(400).send(error);
        }
    },

    //event
    viewEvent: async (req, res) => {
        try {
            const event = await Event.find()
                .populate('analyticId')
                .populate('cameraId');
            const site = await Site.find();
            const analytic = await Analytic.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('config/event/view_event', {
                title: 'Viana | Analytic Assignment',
                alert,
                action: 'view',
                event,
                site,
                analytic,
                page: 'Event'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/analytic');
        }
    },
    addEvent: async (req, res) => {
        try {
            const {analyticId, cameraId, status, description, port} = req.body;
            const camera = await Camera.findOne({_id: cameraId});
            const analytic = await Analytic.findOne({_id: analyticId});
            const new_event = {
                status,
                description,
                port,
                cameraId: camera._id,
                analyticId: analytic._id
            }
            const event  = await Event.create(new_event);
            analytic.eventId.push({_id: event._id});
            camera.eventId.push({_id: event._id});
            await analytic.save();
            await camera.save();
            req.flash('alertMessage', 'Success add camera');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/event');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/event');
        }
    },
    showEditEvent: async (req, res) => {
        try {
            const {id} = req.params;
            const event = await Event.findOne({_id: id})
                .populate('analyticId')
                .populate('cameraId');
            const O_site = await Site.findOne({_id: event.cameraId.siteId});
            const site = await Site.find();
            const analytic = await Analytic.find();
            const camera = await Camera.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('config/event/view_event', {
                title: 'Viana | Event',
                event,
                site,
                O_site,
                camera,
                analytic,
                alert,
                action: 'edit',
                page: 'Event'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/event');
        }
    },
    editEvent: async (req, res) => {
        try {
            const {id} = req.params;
            const  {analyticId, cameraId, status, description, port} = req.body;
            const event = await Event.findOne({_id: id})
                .populate('analyticId')
                .populate('cameraId');

            //hapus eventId di kamera lama
            await Camera.findOne({_id: event.cameraId.id}).then((camera) => {
                camera.eventId.pull(id);
                camera.save();
            });

            //hapus eventId di analytic
            await Analytic.findOne({_id: event.analyticId.id}).then((analytic) => {
                analytic.eventId.pull(id);
                analytic.save();
            });

            const camera = await Camera.findOne({_id: cameraId});
            const analytic = await Analytic.findOne({_id: analyticId});
            analytic.eventId.push({_id: event._id});
            camera.eventId.push({_id: event._id});
            await analytic.save();
            await camera.save();

            event.analyticId = analyticId;
            event.cameraId = cameraId;
            event.status = status;
            event.description = description;
            event.port = port;
            await event.save();

            req.flash('alertMessage', 'Success edit camera');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/event');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/event');
        }
    },
    deleteEvent: async (req, res) => {
        try {
            const {id} = req.params;
            const event = await Event.findOne({_id: id}).populate('cameraId').populate('analyticId');
            await Camera.findOne({_id: event.cameraId.id}).then((data) => {
                data.eventId.pull(id);
                data.save();
            }).catch((error) => {
                req.flash('alertMessage', `${error.message}`);
                req.flash('alertStatus', 'danger'); 
                res.redirect('/configuration/event');
            });
            await Analytic.findOne({_id: event.analyticId.id}).then((data) => {
                data.eventId.pull(id);
                data.save();
            }).catch((error) => {
                req.flash('alertMessage', `${error.message}`);
                req.flash('alertStatus', 'danger'); 
                res.redirect('/configuration/event');
            });
            await event.remove();
            req.flash('alertMessage', 'Success delete camera');
            req.flash('alertStatus', 'success'); 
            res.redirect('/configuration/event');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger'); 
            res.redirect('/configuration/event');
        }
    },

    commandStart: async (req, res) => {
        try {
            let trans = '';
            const {id} = req.params;
            const event = await Event.findOne({_id: id})
                .populate('analyticId')
                .populate('cameraId');

            //ambil analytic dari event yang dijalankan
            const analytic = event.analyticId.name;
            const camera_name = event.cameraId.name;
            
            //start analyticnya
            if(analytic == 'Face Recognition'){
                if(!event.statTrans){
                    trans = await FaceEvent.create({
                        event: {
                            eventId: id,
                            camera_name: camera_name
                        }
                    });
                    trans = trans._id;
                    event.statTrans = true;
                    event.transId = trans;
                }else{
                    trans = event.transId._id; //transaksi id dari event
                }
                
                //start yolo face
                const face = new Face();
                await face.init(SIMULATION_MODE, event.cameraId.ip, event.port, trans, camera_name);
                await face.start();
                var pid = await face.getPid();
            }else if(analytic == 'Cumulative Counting'){
                if(!event.statTrans){
                    trans = await CumEvent.create({
                        event: {
                            eventId: id,
                            camera_name: camera_name
                        }
                    });
                    trans = trans._id;
                    event.statTrans = true;
                    event.transId = trans;
                }else{
                    trans = event.transId._id; //transaksi id dari event
                }


                //start yolo cumulative
                const count = new Counting();
                await count.init(SIMULATION_MODE, event.cameraId.ip, event.port, trans);
                await count.start();
                var pid = await count.getPid();
            }else if(analytic == 'Object Detection'){
                if(!event.statTrans){
                    trans = await ObjectEvent.create({
                        event: {
                            eventId: id,
                            camera_name: camera_name
                        }
                    });
                    trans = trans._id;
                    event.statTrans = true;
                    event.transId = trans;
                }else{
                    trans = event.transId._id; //transaksi id dari event
                }

                //start yolo object detection
                const obj = new ObjectD();
                await obj.init(SIMULATION_MODE, event.cameraId.ip, event.port, trans);
                await obj.start();
                var pid = await obj.getPid();
            }else if(analytic == 'Social Distancing'){
                if(!event.statTrans){
                    trans = await CovidEvent.create({
                        event: {
                            eventId: id,
                            camera_name: camera_name
                        }
                    });
                    trans = trans._id;
                    event.statTrans = true;
                    event.transId = trans;
                }else{
                    trans = event.transId._id; //transaksi id dari event
                }

                //start python social distancing
                const covid = new Covid();
                await covid.init(SIMULATION_MODE, event.cameraId.ip, event.port, trans, camera_name);
                await covid.start();
                var pid = await covid.getPid();
            }

            event.process = true;
            event.pid = pid;
            await event.save();

            res.redirect('/configuration/event');
        } catch (error) {
            res.status(400).send(error);
        }
    },

    commandStop: async (req, res) => {
        try {
            const {id} = req.params;
            const event = await Event.findOne({_id: id})
                .populate('analyticId')
                .populate('cameraId');
            
            //ambil pid
            const pid = event.pid;

            //stop analytic
            process.kill(pid, 'SIGTERM');

            event.process = false;
            event.pid = null;
            await event.save();

            res.redirect('/configuration/event');
        } catch (error) {
            res.status(400).send(error);
        }
    }

}