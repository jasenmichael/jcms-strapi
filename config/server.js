module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", process.env.PORT || 8080),
  frontendUrl: env("FRONTEND_URL", "http://localhost:3000"),
  admin: {
    auth: {
      autoOpen: false,
      secret: env("ADMIN_JWT_SECRET"),
    },
    watchIgnoreFiles: ["**/exports/**"],
  },
});
