const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log("📝 REGISTER DATA RECEIVED:", req.body);
    
    const { name, place, age, education, phone, email, password, termsAccepted } = req.body;
    
    if (!name || !place || !age || !education || !phone || !email || !password || termsAccepted !== true) {
      return res.status(400).json({ message: "All fields required including terms" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      name, place, age, education, phone, email, 
      password: hashedPassword, 
      termsAccepted: true
    });
    
    await user.save();
    console.log("✅ USER SAVED TO MONGODB:", user._id);

    // Generate proper token
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role }, 
      process.env.JWT_SECRET || "mysecretkey123", 
      { expiresIn: "7d" }
    );
    
    res.status(201).json({
      token,
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 LOGIN ATTEMPT:", email);

    // Admin login
    if (email === "admin@bookstore.com" && password === "admin123") {
      const token = jwt.sign(
        { userId: "admin123", role: "admin" }, 
        process.env.JWT_SECRET || "mysecretkey123", 
        { expiresIn: "7d" }
      );
      return res.json({
        token,
        user: { id: "admin123", name: "Admin", email: "admin@bookstore.com", role: "admin" }
      });
    }

    // User login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role }, 
      process.env.JWT_SECRET || "mysecretkey123", 
      { expiresIn: "7d" }
    );
    
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
