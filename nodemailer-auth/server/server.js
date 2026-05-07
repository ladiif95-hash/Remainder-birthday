import bcrypt from "bcrypt";
import cors from "cors";
import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { fileURLToPath } from "node:url";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/birthday-reminder";
let databaseConnection;

app.use(cors());
app.use(express.json());

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const categories = new Set(["Family", "Friends", "Work"]);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const birthdaySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Family", "Friends", "Work"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Birthday = mongoose.model("Birthday", birthdaySchema);

const transporter =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : null;

function validateAuth({ email, password }) {
  if (!email || !emailRegex.test(email)) return "Invalid email address";
  if (!password || password.length < 6) return "Password must be at least 6 characters";
  return null;
}

function validateBirthday({ name, date, category }) {
  if (!name || name.trim().length < 2) return "Name must be at least 2 characters";
  if (!date || Number.isNaN(new Date(date).getTime())) return "Birthday date is required";
  if (!categories.has(category)) return "Category must be Family, Friends, or Work";
  return null;
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function publicBirthday(birthday) {
  return {
    id: birthday.id,
    name: birthday.name,
    date: birthday.date,
    category: birthday.category,
    notes: birthday.notes || "",
    createdAt: birthday.createdAt,
  };
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  databaseConnection ||= mongoose.connect(MONGODB_URI).then(() => {
    console.log("MongoDB connected");
  });

  return databaseConnection;
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid auth token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth failed:", error.message);
    return res.status(401).json({ error: "Invalid auth token" });
  }
}

async function sendWelcomeEmail(toEmail, name) {
  if (!transporter) return;

  await transporter.sendMail({
    from: `"Birthday Reminder" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome to Birthday Reminder",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border-radius:14px;background:#fff7fb">
        <h1 style="color:#d94396">Welcome, ${name || "friend"}!</h1>
        <p style="color:#344054;line-height:1.6">
          Your Birthday Reminder account is ready. Add the people you care about and we will help you keep track of every celebration.
        </p>
      </div>
    `,
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", asyncHandler(async (_req, _res, next) => {
  await connectDatabase();
  next();
}));

app.post("/api/signup", asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const error = validateAuth({ email, password });

    if (error) return res.status(400).json({ error });
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
    });

    sendWelcomeEmail(user.email, user.name).catch((error) => {
      console.error("Email send failed:", error.message);
    });

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}));

app.post("/api/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const error = validateAuth({ email, password });

  if (error) return res.status(400).json({ error });

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ token: signToken(user), user: publicUser(user) });
}));

app.get("/api/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get("/api/birthdays", authenticate, asyncHandler(async (req, res) => {
  const birthdays = await Birthday.find({ userId: req.user.id }).sort({ createdAt: -1 });

  res.json({ birthdays: birthdays.map(publicBirthday) });
}));

app.post("/api/birthdays", authenticate, asyncHandler(async (req, res) => {
  const { name, date, category, notes = "" } = req.body;
  const error = validateBirthday({ name, date, category });

  if (error) return res.status(400).json({ error });

  const birthday = await Birthday.create({
    userId: req.user.id,
    name: name.trim(),
    date,
    category,
    notes: notes.trim(),
  });

  res.status(201).json({ birthday: publicBirthday(birthday) });
}));

app.delete("/api/birthdays/:id", authenticate, asyncHandler(async (req, res) => {
  const birthday = await Birthday.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!birthday) {
    return res.status(404).json({ error: "Birthday not found" });
  }

  res.json({ ok: true });
}));

app.use("/api", (req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Server error" });
});

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`API running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      process.exit(1);
    });
}

export default app;
