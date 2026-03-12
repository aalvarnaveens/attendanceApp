const Attendance = require("../models/attendanceModel");
const { getDistance } = require("geolib");


exports.checkIn = async (req, res) => {
 try {

  const { latitude, longitude } = req.body;

  const officeLocation = {
   latitude: parseFloat(process.env.OFFICE_LAT),
   longitude: parseFloat(process.env.OFFICE_LNG)
  };

  const OFFICE_RADIUS = parseInt(process.env.OFFICE_RADIUS);

  const distance = getDistance(
   { latitude: Number(latitude), longitude: Number(longitude) },
   officeLocation
  );

  console.log("Distance from office:", distance);

  if (distance > OFFICE_RADIUS) {
   return res.status(400).json({
    message: "You must be within office radius to check in"
   });
  }

  // Save attendance
  const attendance = await Attendance.create({
   userId: req.user.id,
   checkIn: new Date(),
   location: {
    latitude: Number(latitude),
    longitude: Number(longitude)
   }
  });

  res.json({
   success: true,
   message: "Check-in successful",
   distance
  });

 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};



exports.checkOut = async (req,res)=>{
 try{

 const attendance = await Attendance.findOne({
  userId:req.user.id,
  checkOut:null
 });

 if(!attendance){
  return res.status(400).json({
   message:"No active check-in found"
  });
 }

 attendance.checkOut = new Date();

 await attendance.save();

 res.json({
  success:true,
  message:"Check-out successful"
 });

 }catch(err){
  res.status(500).json({message:err.message});
 }
};