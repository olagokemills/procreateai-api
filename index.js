const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./config/config");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("./controllers/passport.controller");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport and session handling
app.use(passport.initialize());
app.use(passport.session());

const fs = require("fs");
const path = require("path");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Make UPLOADS_DIR available to other modules
global.UPLOADS_DIR = UPLOADS_DIR;

const PORT = process.env.PORT;

// Middleware

app.get("/", (req, res) => {
  res.json({ message: "Welcome, human" });
});

//routes
require("./routers/index.js")(app);

// MongoDB connection
mongoose
  .connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server running on portss ${PORT}`);
});
