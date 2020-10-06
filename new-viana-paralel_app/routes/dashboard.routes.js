const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const {upload, uploadMultiple} = require('../middlewares/multer');
const middleware = require('../middlewares/face_py');

router.route('/home')
    .get(dashboardController.viewHome);

router.route('/cctv')
    .get(dashboardController.viewCCTV);
router.route('/cctv/process')
    .get(dashboardController.cctvProcess);
router.route('/cctv/detail/:id')
    .get(dashboardController.cctvDetail);

router.route('/face-recognition')
    .get(dashboardController.viewFaceRecognition);   

router.route('/face-enrollment')
    .get(dashboardController.viewFaceEnrollment)
    .post(upload, middleware.createDir, dashboardController.addFaceEnrollment);

router.route('/face-loading')
    .get(dashboardController.loading);

router.route('/face-enrollment/:id')
    .get(dashboardController.showEditFaceEnrollment)
    .put(upload, dashboardController.editFaceEnrollment)
    .delete(dashboardController.deleteFaceEnrollment);

router.route('/maps')
    .get(dashboardController.viewMaps);
router.route('/maps/camera')
    .get(dashboardController.getMaps);
router.route('/maps/camera/:id')    
    .get(dashboardController.viewCameraById);

router.route('/history')
    .get(dashboardController.viewHistory);

module.exports = router;