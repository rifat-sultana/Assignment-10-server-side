const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).send({ success: false, message: "All fields are required" });
    }

    const usersCollection = getDB().collection("users");
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    });

    res.status(201).send({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).send({ success: false, message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  console.log("Login Body:", req.body);
  console.log("Admin Email:", process.env.ADMIN_EMAIL);
  console.log("Admin Password:", process.env.ADMIN_PASSWORD);
  try {
    const { email, password } = req.body;

    // Admin Login
if (
  email === process.env.ADMIN_EMAIL &&
  password === process.env.ADMIN_PASSWORD
) {
  const token = jwt.sign(
    {
      email,
      role: "admin",
      name: "Admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.send({
    success: true,
    token,
    user: {
      email,
      role: "admin",
      name: "Admin",
    },
  });
}

    if (!email || !password) {
      return res.status(400).send({ success: false, message: "Email and password are required" });
    }

    const usersCollection = getDB().collection("users");
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(400).send({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      success: true,
      message: "Login successful",
      token,
      user: { email: user.email, role: user.role, name: user.name },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send({ success: false, message: "Login failed" });
  }
});

module.exports = router;
