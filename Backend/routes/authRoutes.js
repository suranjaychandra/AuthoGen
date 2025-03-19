const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// 📌 1️⃣ User Registration Route
router.post("/register", [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 })
], async (req, res) => {
    console.log("📌 Register Route Hit"); // Debugging log
    console.log("📌 Request Body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("❌ Validation Errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            console.log("❌ Missing Fields");
            return res.status(400).json({ message: "All fields are required" });
        }

        let user = await User.findOne({ email });
        if (user) {
            console.log("❌ User Already Exists");
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ username, email, password: hashedPassword });
        await user.save();

        console.log("✅ User Registered Successfully");
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});

// 📌 2️⃣ User Login Route
router.post("/login", [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password is required").exists()
], async (req, res) => {
    console.log("📌 Login Route Hit");
    console.log("📌 Request Body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("❌ Validation Errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            console.log("❌ Invalid Credentials: User not found");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Invalid Credentials: Password incorrect");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log("✅ Login Successful");
        res.json({ token });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});

module.exports = router;
