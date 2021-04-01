module.exports = ({ env }) => ({
  host:  env('HOST', process.env.HOST || process.env.HEROKU_URL), //env('HOST'),
  port: env.int('PORT', process.env.PORT || 80),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'e50c90ed2f94fe74f02292126b7cb70d'),
    },
  },
});
