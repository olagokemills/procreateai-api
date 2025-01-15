// const express = require("express");
// const router = express.Router();
const authController = require("../controllers/auth.controller");
const passport = require("../controllers/passport.controller");
const jwt = require("jsonwebtoken");

module.exports = (app) => {
  //Get all agents
  app.get("/tt", (req, res) => {
    res.json({ message: "Welcome, subhmuns" });
  });

  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      console.log("coming?");
      const token = jwt.sign({ userId: req.user._id }, "BigAssSecret", {
        expiresIn: "1h",
      });
      res.redirect(
        `http://localhost:7900/auth-callback?token=${token}&userId=${req.user._id}`
      );
    }
  );

  app.get("/api/auth/verify/:id", authController.verifyRubbish);

  app.post("/api/auth/signup", authController.signup);
  app.post("/api/auth/login", authController.login);
};
