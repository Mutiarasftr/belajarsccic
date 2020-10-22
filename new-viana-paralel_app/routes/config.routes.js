const router = require('express').Router();
const configController = require('../controllers/config.controller');

router.route('/site')
    .get(configController.viewSite)
    .post(configController.addSite)
    .put(configController.editSite);
router.route('/site/:id')
    .get(configController.siteById)
    .delete(configController.deleteSite);

router.route('/camera')
    .get(configController.viewCamera)
    .post(configController.addCamera);
router.route('/camera/:id')
    .get(configController.showEditCamera)
    .put(configController.editCamera)
    .delete(configController.deleteCamera);


router.route('/analytic')
    .get(configController.viewAnalytic)
//     .post(configController.addAnalytic)
//     .put(configController.editAnalytic);
// router.route('/analytic/:id')
//     .delete(configController.deleteAnalytic);

router.route('/parameter')
    .get(configController.viewParameter)
    .post(configController.addParameter)
    .put(configController.editParameter);
router.route('/parameter/:id')
    .get(configController.parameterById)
    .delete(configController.deleteParameter);

router.route('/site2')
    .get(configController.viewSite2)
    .post(configController.addSite2)
    .put(configController.editSite2);
router.route('/site2/:id')
    .get(configController.site2ById)
    .delete(configController.deleteSite2);

router.route('/event')
    .get(configController.viewEvent)
    .post(configController.addEvent);
router.route('/event/:id')
    .get(configController.showEditEvent)
    .put(configController.editEvent)
    .delete(configController.deleteEvent);

router.route('/event/command/start/:id')
    .get(configController.commandStart);

router.route('/event/command/stop/:id')
    .get(configController.commandStop);

module.exports = router;
