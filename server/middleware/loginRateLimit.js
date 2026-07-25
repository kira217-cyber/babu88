// middleware/loginRateLimit.js
// Lightweight in-memory brute-force guard for the admin login endpoint.
// No external dependency needed - fine for a single-process deployment.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const attemptsByKey = new Map();

const keyFor = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const email = String(req.body?.email || "").toLowerCase().trim();
  return `${ip}:${email}`;
};

export const loginRateLimit = (req, res, next) => {
  const key = keyFor(req);
  const now = Date.now();
  const entry = attemptsByKey.get(key);

  if (entry && now - entry.firstAttemptAt < WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - entry.firstAttemptAt)) / 1000);
    return res.status(429).json({
      message: `Too many login attempts. Try again in ${retryAfterSec}s.`,
    });
  }

  next();
};

export const registerFailedLogin = (req) => {
  const key = keyFor(req);
  const now = Date.now();
  const entry = attemptsByKey.get(key);

  if (!entry || now - entry.firstAttemptAt >= WINDOW_MS) {
    attemptsByKey.set(key, { count: 1, firstAttemptAt: now });
  } else {
    entry.count += 1;
  }
};

export const clearFailedLogin = (req) => {
  attemptsByKey.delete(keyFor(req));
};
