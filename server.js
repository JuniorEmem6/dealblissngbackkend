const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Coupon = require("./models/Coupon");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("./models/Admin");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const JWT_SECRET = "big_secret"; // Replace with a secure secret

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
  cors({
    origin: "*",
  })
);

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://dealbliss:dealblissng2000@cluster0.rzcv1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
    // seedAdmin();
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// API Routes

app.get("/adminLogin", (req, res) => {
  res.render("adminLogin");
});

app.get("/adminDashboard", (req, res) => {
  res.render("adminDashboard");
});
// Token validation endpoint
app.get("/api/admin/validateToken", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authorizationHeader = req.headers["authorization"];

  // Check if the authorization header is present
  if (!authorizationHeader)
    return res.status(403).json({ error: "Access denied" });

  // Split the string to get the token (the second part after "Bearer")
  const token = authorizationHeader.split(" ")[1];

  // If token is missing, deny access
  if (!token) return res.status(403).json({ error: "Access denied" });

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware/route handler
  });
}

// Admin login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(401).json({ error: "Invalid username or password" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid username or password" });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error during login" });
  }
});

// Seed admin data
const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: "Eragon" });
    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Eragonjr", 10);
    const admin = new Admin({
      username: "Eragon",
      password: hashedPassword,
    });
    await admin.save();
    console.log("Admin created");
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
};

// Get all coupons for the admin dashboard
app.get("/api/coupons", (req, res) => {
  Coupon.find()
    .then((coupons) => res.json(coupons))
    .catch((err) => res.status(500).json({ error: "Error fetching coupons" }));
});

// Add a new coupon
app.post("/api/coupons", (req, res) => {
  const { description, discount, code, link } = req.body; // Include link
  const newCoupon = new Coupon({
    description,
    discount,
    code,
    link, // Save the link
    used: 0,
  });

  newCoupon
    .save()
    .then(() => res.status(201).json({ message: "Coupon added successfully" }))
    .catch((err) => res.status(500).json({ error: "Error adding coupon" }));
});

// Edit a coupon's details
app.put("/api/coupons/:id", (req, res) => {
  const couponId = req.params.id;
  const { offer, code, link } = req.body; // Include link

  Coupon.findByIdAndUpdate(couponId, { offer, code, link }, { new: true })
    .then((updatedCoupon) => res.json(updatedCoupon))
    .catch((err) => res.status(500).json({ error: "Error updating coupon" }));
});

// Delete a coupon
app.delete("/api/coupons/:id", (req, res) => {
  const couponId = req.params.id;

  Coupon.findByIdAndDelete(couponId)
    .then(() => res.json({ message: "Coupon deleted successfully" }))
    .catch((err) => res.status(500).json({ error: "Error deleting coupon" }));
});

// Increment click count for a coupon
app.post("/api/coupons/:id/click", (req, res) => {
  const couponId = req.params.id;
  Coupon.findByIdAndUpdate(couponId, { $inc: { used: 1, today: 1 } })
    .then(() => res.status(200).json({ message: "Coupon click count updated" }))
    .catch((err) =>
      res.status(500).json({ error: "Error updating coupon click count" })
    );
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
