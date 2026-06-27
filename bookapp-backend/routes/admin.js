const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.get("/", auth, admin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;