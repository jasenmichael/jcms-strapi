module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'mysql',
        host: env('DATABASE_HOST', '10.14.72.111'),
        port: env.int('DATABASE_PORT', 3307),
        database: env('DATABASE_NAME', 'jcms'),
        username: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'Strapi123456'),
        // schema: 'public',
        ssl: env.bool('DATABASE_SSL', false),
      },
      options: {},
    },
  },
});

// module.exports = ({ env }) => ({
//   defaultConnection: 'default',
//   connections: {
//     default: {
//       connector: 'bookshelf',
//       settings: {
//         client: 'sqlite',
//         filename: env('DATABASE_FILENAME'),
//       },
//       options: {
//         useNullAsDefault: true,
//       },
//     },
//   },
// });
