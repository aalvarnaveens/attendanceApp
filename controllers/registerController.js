const User = require("../models/registerModel");
const { cloudinary } = require("../middleware/upload");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



exports.createRegister = async (req, res) => {
  try {
    const { name, employeeId, phoneNumber, salary,role,email,password } = req.body;
// check user
const userExists = await User.findOne({email});

if(userExists){
 return res.status(400).json({
  message:"User already exists"
 });
}

// 🔐 password hash here
const hashedPassword = await bcrypt.hash(password,10);
    let frontImage = "";
    let backImage = "";

    if (req.files?.frontImage) {
      const result = await cloudinary.uploader.upload(
        req.files.frontImage[0].path,
        { folder: "register/idcard" }
      );
      frontImage = result.secure_url;
    }

    if (req.files?.backImage) {
      const result = await cloudinary.uploader.upload(
        req.files.backImage[0].path,
        { folder: "register/idcard" }
      );
      backImage = result.secure_url;
    }

    const register = await User.create({
      name,
      employeeId,
      phoneNumber,
        role,
      salary,
      email,
      password: hashedPassword,
      idCard: {
        frontImage,
        backImage,
      },
    });

    res.status(201).json({
      success: true,
      data: register,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};




// Login
exports.login = async (req, res) => {
 try {

  const { email, password } = req.body;



  const user = await User.findOne({ email });

  if (!user) {
  
   return res.status(400).json({ message: "Invalid Email" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
  
   return res.status(400).json({ message: "Invalid Password" });
  }

  const token = jwt.sign(
   { id: user._id, role: user.role },
   process.env.JWT_SECRET,
   { expiresIn: "7d" }
  );



  // 🍪 cookie la token save
  res.cookie("token", token, {
   httpOnly: true,
   secure: false,
   sameSite: "strict",
   maxAge: 7 * 24 * 60 * 60 * 1000
  });



  res.json({
   success: true,
   message: "Login successful"
  });

 } catch (err) {
  console.log("Login Error:", err);
  res.status(500).json({ message: err.message });
 }
};

exports.Userlogout = (req, res) => {
 res.clearCookie("token").json({
  success: true,
  message: "Logout successfully"
 });
};




