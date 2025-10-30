import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/user-model.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import otpGenerator from "otp-generator";
import { transporter } from "../config/nodemailer.js";
import fs from "fs";
import path from "path";

const otpFilePath = path.join(process.cwd(), "otpStore.json");

const readOtpStore = () => {
  try {
    if (!fs.existsSync(otpFilePath)) {
      fs.writeFileSync(otpFilePath, JSON.stringify({}), "utf-8");
    }
    const data = fs.readFileSync(otpFilePath, "utf-8");
    return JSON.parse(data || "{}");
  } catch (error) {
    console.error("Error reading otpStore.json:", error);
    return {};
  }
};

const writeOtpStore = (data) => {
  try {
    fs.writeFileSync(otpFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing otpStore.json:", error);
  }
};

const start = async (req, res) => {
  if (req.user) {
    return res.status(200).json(new ApiResponse(200, req.user, "User Found"));
  } else {
    return res.status(404).json(new ApiResponse(404, null, "Use Not Found"));
  }
};

// otp send controller
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    // Generate a 6-digit OTP (numbers only)
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    console.log("Generated OTP:", otp);

    // Send email using Nodemailer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Email Verification",
      text: `Your OTP for email verification is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    // Store OTP in file temporarily
    const otpData = fs.existsSync(otpFilePath)
      ? JSON.parse(fs.readFileSync(otpFilePath, "utf8"))
      : {};

    otpData[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // expires in 5 minutes
    };

    fs.writeFileSync(otpFilePath, JSON.stringify(otpData, null, 2));

    console.log("OTP stored for", email);

    // Respond to frontend
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP.",
    });
  }
};

// verify otp controller
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required." });
    }

    const otpStore = readOtpStore();
    const storedEntry = otpStore[email];

    if (!storedEntry) {
      return res
        .status(400)
        .json({ success: false, message: "No OTP found for this email." });
    }

    // Use expiresAt from your JSON instead of createdAt
    const isExpired = Date.now() > storedEntry.expiresAt;
    if (isExpired) {
      delete otpStore[email];
      writeOtpStore(otpStore);
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP expired. Please request a new one.",
        });
    }

    if (storedEntry.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // Success — delete OTP after verification
    delete otpStore[email];
    writeOtpStore(otpStore);

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

const registerUser = async (req, res) => {
  console.log("Registration Started");
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    console.log("Registration Failed data insufficeient ");
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Please provide all required fields: fullName, email, and password."
        )
      );
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Registration Failed already registered user");
      return res
        .status(409)
        .json(new ApiError(409, "User already registered."));
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
    });

    console.log("Registration Successful");
    res.status(201).json(
      new ApiResponse(
        201,
        {
          user: {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
          },
        },
        "User successfully registered."
      )
    );
  } catch (err) {
    // Change the error parameter to err
    console.log("Registration Failed due to server error");
    console.error("Error while creating user:", err);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error.", [], err.stack));
  }
  // return res.status(200).send("Hello WOrld")
};

const loginUser = async (req, res) => {
  console.log("Login Started");
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Login Failed: Missing required fields");
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Please provide all required fields: email and password."
        )
      );
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Login Failed: User not found");
      return res.status(404).json(new ApiError(404, "User not found."));
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      console.log("Login Failed: Invalid credentials");
      return res.status(406).json(new ApiError(406, "Invalid credentials."));
    }

    const jwtToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_SECRET_EXPIRES_IN } // Add token expiration for better security
    );

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set cookie to expire in 1 day
      sameSite: process.env.NODE_ENV == "Dev" ? "lax" : "none", // Set SameSite attribute for better security
      secure: process.env.NODE_ENV == "Dev" ? false : true, // Set Secure attribute for better security
    };

    console.log("Login Successful");
    return res
      .cookie("token", jwtToken, cookieOptions)
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            user: {
              id: user._id,
              email: user.email,
              fullName: user.fullName,
            },
          },
          "User logged in successfully."
        )
      );
  } catch (err) {
    console.log("Login Failed: Server error");
    console.error("Error during login:", err);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [], err.stack));
  }
};

const logoutUser = (req, res) => {
  console.log("Logged out");
  if (req.user) {
    return res
      .clearCookie("token")
      .status(200)
      .json(new ApiResponse(200, null, "User logged out successfully."));
  } else {
    return res.status(404).json(new ApiError(404, "User not found."));
  }
};

export { start, loginUser, logoutUser, registerUser };
