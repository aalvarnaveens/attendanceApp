const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {

 let token;

 // Header token
 if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
  token = req.headers.authorization.split(" ")[1];
 }

 // Cookie token
 if (!token && req.cookies?.token) {
  token = req.cookies.token;
 }

 if (!token) {
  return res.status(401).json({ message: "Not authorized" });
 }

 try {

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded;

  next();

 } catch (err) {
  return res.status(401).json({ message: "Token invalid" });
 }

};