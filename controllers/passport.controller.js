const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/AuthUsers.model");
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "78750389435-j6jlnrad61kr1r5tt987jrd8kts663jp.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
          await user.save();
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
