import rateLimit from "express-rate-limit";


// 🔐 Signup limiter
export const signupLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 3, // 3 signups per minute
  message: {
    message: "Too many signup attempts. Try again later.",
  },
});

// 🔐 Login limiter (brute-force protection)
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // 5 login attempts per minute
  message: {
    message: "Too many login attempts. Try again later.",
  },
});

// 🔐 General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requests
  message: {
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 💬 Chat message limiter (STRICT)
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 messages per minute
  message: {
    message: "You're sending messages too fast. Slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});