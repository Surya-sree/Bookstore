const express = require("express");
const Book = require("../models/Book");
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");

const router = express.Router();

/* =========================
   GET ALL BOOKS
========================= */
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().limit(20);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET SINGLE BOOK
========================= */
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   LIKE / UNLIKE BOOK
========================= */
router.post("/:id/like", auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const userId = req.user.id;

    const alreadyLiked = book.likedBy.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      book.likes = Math.max(0, book.likes - 1);
      book.likedBy.pull(userId);
    } else {
      book.likes++;
      book.likedBy.push(userId);
    }

    await book.save();

    res.json({
      likes: book.likes,
      liked: !alreadyLiked,
    });
  } catch (error) {
    res.status(500).json({ message: "Like failed" });
  }
});

/* =========================
   ADD COMMENT
========================= */
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment required",
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    book.comments.push({
      user: req.user.id,
      text,
    });

    await book.save();
    await book.populate("comments.user", "name");

    res.status(201).json({
      message: "Comment added",
      comments: book.comments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Comment failed",
    });
  }
});

/* =========================
   EDIT COMMENT
========================= */
router.put("/:id/comment/:commentId", auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const comment = book.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (
      comment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

  if (!req.body.text || !req.body.text.trim()) {
  return res.status(400).json({
    message: "Comment cannot be empty",
  });
}

comment.text = req.body.text.trim();

    await book.save();
    await book.populate("comments.user", "name");

    res.json({
      message: "Comment updated",
      comments: book.comments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Edit failed",
    });
  }
});

/* =========================
   DELETE COMMENT
========================= */
router.delete("/:id/comment/:commentId", auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const comment = book.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (
      comment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    book.comments.pull(req.params.commentId);

    await book.save();

    res.json({
      message: "Comment deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
    });
  }
});

/* =========================
   ADMIN ADD BOOK
========================= */
router.post("/add-book", auth, adminAuth, async (req, res) => {
  try {
    const book = await Book.create(req.body);

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   ADMIN UPDATE BOOK
========================= */
router.put("/update-book/:id", auth, adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================
   ADMIN DELETE BOOK
========================= */
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;