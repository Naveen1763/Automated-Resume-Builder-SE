import {
  start,
  loginUser,
  logoutUser,
  registerUser,
  sendOtp,
  verifyOtp,
} from "../controller/user-controller.js";
import { Router } from "express";
import { isUserAvailable } from "../middleware/auth.js";

const router = Router();

router.get("/", isUserAvailable, start);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isUserAvailable, logoutUser);
// send otp
router.post("/send-otp", sendOtp);
// verify otp
router.post("/verify-otp", verifyOtp);

export default router;
