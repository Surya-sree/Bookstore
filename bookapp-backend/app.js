const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Book = require("./models/Book");

const app = express();

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   Body Parser
========================= */
app.use(express.json());

/* =========================
   MongoDB Connection
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

/* =========================
   API Routes
========================= */

// Authentication
app.use("/api/auth", require("./routes/auth"));

// Users
app.use("/api/users", require("./routes/users"));

// Books
app.use("/api/books", require("./routes/books"));

// Rentals
// Change "rentals" to "rentalRoutes" below ONLY if your file is named rentalRoutes.js
app.use("/api/rentals", require("./routes/rentals"));

// Admin
app.use("/api/admin", require("./routes/admin"));

/* =========================
   Seed Database (Run Once)
========================= */
app.get("/api/seed", async (req, res) => {
  try {
    const count = await Book.countDocuments();

    if (count > 0) {
      return res.json({
        success: true,
        message: "Books already exist in database.",
      });
    }

    const booksData = Array.from({ length: 20 }, (_, i) => ({
      title: `Book Title ${i + 1}`,
      author: `Author ${i + 1}`,
      genre: ["Fiction", "Non-Fiction", "Sci-Fi"][i % 3],
      description: `Description for Book ${i + 1}`,
      publicationYear: 2010 + (i % 10),
      isbn: `ISBN-${Date.now()}-${i}`,
      price: Math.floor(Math.random() * 20) + 10,
      image: `https://picsum.photos/300/400?random=${i}`,
      available: true,
    }));

    await Book.insertMany(booksData);

    res.status(201).json({
      success: true,
      message: "20 Books Added Successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =========================
   Home Route
========================= */
app.get("/", (req, res) => {
  res.send("📚 Book Rental API is Running...");
});

/* =========================
   404 Route
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* =========================
   Start Server
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});