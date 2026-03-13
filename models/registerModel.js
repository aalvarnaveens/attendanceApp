const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    role:{
  type:String,
  required:true,
  enum:["Admin","Superadmin","Employee"]
 },
   password: {
    type: String,
    required: true
  },
    email: {
    type: String,
    required: true,
    unique: true
  },
    phoneNumber: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },

    idCard: {
      frontImage: {
        type: String,
        required: true,
      },
      backImage: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Register", registerSchema);