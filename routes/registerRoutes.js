const express = require("express");
const router = express.Router();

const { upload } = require("../middleware/upload");
const { createRegister,login,Userlogout } = require("../controllers/registerController");

router.post(
  "/register",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  createRegister
);
router.post("/login",login);
router.post("/logout", Userlogout);

module.exports = router;