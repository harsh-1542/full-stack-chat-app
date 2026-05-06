import express from "express";
import { checkAuth, login, logout, savePublicKey, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { apiLimiter, loginLimiter, signupLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/logout", protectRoute, logout);

router.put("/update-profile", protectRoute, updateProfile);

router.post("/public-key", apiLimiter, savePublicKey);

router.get("/check", protectRoute, checkAuth);
export default router;
