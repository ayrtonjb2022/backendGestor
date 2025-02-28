const express = require('express');
const router = express();
const {allNotifications,postNotificationC,acceptInvitation} = require('../controller/notificationsController');
const {authenticate} = require('../middleware/authMiddleware');

router.get('/notificaciones/', authenticate,allNotifications);
router.post('/notificaciones', authenticate,postNotificationC);
router.post('/invitations/accept/', authenticate,acceptInvitation);



module.exports = router