// * Requiring mongoose
var mongoose = require("mongoose");

// * DB schema
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  title: String,
  body: String
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;