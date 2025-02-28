const {getInfoUser,upDateUser,updateUserPassword} = require("../controller/userInfController");
const {authenticate} = require("../middleware/authMiddleware");
const express = require('express');
const router = express.Router();

router.get("/data", authenticate,getInfoUser);
router.put("/update", authenticate,upDateUser);
router.put("/updateP",authenticate,updateUserPassword);


module.exports = router