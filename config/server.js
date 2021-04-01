module.exports = ({ env }) => ({
  host:  env('HOST',  '0.0.0.0'), //process.env.HOST), //env('HOST'),
  port: env.int('PORT', process.env.PORT || 8080),
  admin: {
    auth: {
      autoOpen: false,
      secret: env('ADMIN_JWT_SECRET', 'e50c90ed2f94fe74f02292126b7cb70d'),
    },
  },
});
