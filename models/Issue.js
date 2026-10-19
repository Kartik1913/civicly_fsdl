const mongoose = require("mongoose");

// Schema corresponding to the domain model as taught in the syllabus
module.exports = mongoose.model("Issue", new mongoose.Schema({
  ticketId: String,
  reporterName: String,
  title: String,
  category: String,
  location: String,
  pinCode: String,
  locality: String,
  landmark: String,
  description: String,
  status: {
    type: String,
    default: "Submitted"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}));
