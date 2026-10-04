
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "change-this-secret-before-production";

app.use(cors());
app.use(express.json());

const users = [];
const history = [];

app.get("/", (req, res) => {
  res.json({
    name: "FACT AI",
    status: "online",
    message: "FACT AI API is running"
  });
});

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        error: "Name, email and password (6+ characters) required"
      });
    }

    const exists = users.find(
      u => u.email === email.toLowerCase()
    );

    if (exists) {
      return res.status(409).json({
        error: "Email already registered"
      });
    }

    const user = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10)
    };

    users.push(user);

    const token = jwt.sign(
      { id: user.id },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email?.toLowerCase()
  );

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      error: "Invalid email or password"
    });
  }

  const token = jwt.sign(
    { id: user.id },
    SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Login required" });
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.post("/api/analyze", auth, (req, res) => {
  const { results = [] } = req.body;

  if (!Array.isArray(results) || results.length === 0) {
    return res.status(400).json({
      error: "Please provide previous results"
    });
  }

  const counts = {};

  results.forEach(value => {
    const key = String(value);
    counts[key] = (counts[key] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1]);

  const analysis = {
    total: results.length,
    frequencies: counts,
    mostFrequent: sorted[0][0],
    note: "Historical frequency is not a guarantee of future results."
  };

  const record = {
    id: Date.now().toString(),
    userId: req.user.id,
    analysis,
    createdAt: new Date().toISOString()
  };

  history.push(record);

  res.json(analysis);
});

app.get("/api/history", auth, (req, res) => {
  const userHistory = history.filter(
    item => item.userId === req.user.id
  );

  res.json(userHistory);
});

app.post("/api/chat", auth, (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message required"
    });
  }

  res.json({
    reply: "FACT AI received your message: " + message,
    note: "Connect an AI model to enable intelligent conversations."
  });
});

app.listen(PORT, () => {
  console.log(`FACT AI server running on port ${PORT}`);
});
