const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

 userId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },

 checkIn:Date,
 checkOut:Date,

 location:{
  latitude:Number,
  longitude:Number
 }

},{timestamps:true});

module.exports = mongoose.model("Attendance",attendanceSchema);