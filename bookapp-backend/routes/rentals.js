const express = require("express");
const router = express.Router();

const Rental = require("../models/Rental");
const Book = require("../models/Book");
const auth = require("../middleware/authMiddleware");

/* =========================
   GET MY RENTALS
========================= */
router.get("/", auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user._id })
      .populate("book");

    res.json(rentals);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   REQUEST BOOK RENTAL
========================= */
router.post("/request/:bookId", auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    if (!book.available) {
      return res.status(400).json({
        message: "Book is not available",
      });
    }

    const rental = new Rental({
      user: req.user._id,
      book: book._id,
      status: "requested",
    });

    await rental.save();

    res.status(201).json({
      message: "Rental request sent successfully",
      rental,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   RETURN BOOK
========================= */
router.put("/return/:id", auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    rental.status = "returned";
    rental.returnDate = new Date();

    await rental.save();

    await Book.findByIdAndUpdate(rental.book, {
      available: true,
      rentedBy: null,
    });

    res.json({
      message: "Book returned successfully",
      rental,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;