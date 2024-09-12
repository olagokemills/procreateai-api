module.exports = (app) => {
  require("./auth.routes")(app);
  require("./video.routes")(app);
};
