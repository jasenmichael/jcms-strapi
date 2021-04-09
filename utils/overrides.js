const fs = require("fs");

console.log("running overrides");

const files = [
  {
    dir: "./extensions/admin/models/User.js",
    dirDist: "./node_modules/strapi-admin/models/User.js",
  },
  {
    dir: "./admin/src/containers/Admin/Logout/index.js",
    dirDist: "./node_modules/strapi-admin/admin/src/containers/Admin/Logout/index.js",
  },
];

files.forEach((file) => {
  fs.copyFileSync(file.dir, file.dirDist);
});
