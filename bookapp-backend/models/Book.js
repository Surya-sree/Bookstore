const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  genre: { type: String, default: "" },
  description: { type: String, default: "" },
  publicationYear: { type: Number },
  isbn: { type: String, unique: true, sparse: true },
  price: { type: Number, default: 0 },
  image: { type: String, default: "" },
  available: { type: Boolean, default: true },
  rentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
