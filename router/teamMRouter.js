const express = require('express');
const router = express.Router();
const {getTeamMembers, getDataMembersByid, createNewTeam,deleteTeam,updateTeam} = require('../controller/teamMeController')
const {authenticate} = require('../middleware/authMiddleware');


router.get('/allTeam/', authenticate, getTeamMembers);
router.get('/allTeam/dst/:id', authenticate, getDataMembersByid );
router.post('/create', authenticate,createNewTeam);
router.delete('/delete', authenticate,deleteTeam);
router.put('/update', authenticate,updateTeam);

module.exports = router;