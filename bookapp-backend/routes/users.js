const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Rental = require("../models/Rental");

const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");

/* =========================
   USER: PROFILE + RENTALS
========================= */
router.get("/profile/full", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    const rentals = await Rental.find({
      user: req.user._id,
    }).populate("book");

    res.json({
      user,
      rentals,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   GET USER PROFILE
========================= */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("rentals")
      .select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Profile fetch failed",
    });
  }
});

/* =========================
   UPDATE USER PROFILE
========================= */
router.put("/profile", auth, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "place",
      "age",
      "phone",
      "education",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
      }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Update failed",
    });
  }
});

/* =========================
   ADMIN - GET ALL USERS
========================= */
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({
      role: "user",
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Users fetch failed",
    });
  }
});

/* =========================
   ADMIN - GET SINGLE USER
========================= */
router.get("/:id", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const rentals = await Rental.find({
      user: req.params.id,
    }).populate("book");

    res.json({
      user,
      rentals,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   ADMIN - UPDATE USER
========================= */
router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "User update failed",
    });
  }
});

/* =========================
   ADMIN - DELETE USER
========================= */
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await Rental.deleteMany({
      user: req.params.id,
    });

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
    });
  }
});

module.exports = router;