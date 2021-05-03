"use strict";
/*
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = async () => {
  console.log("bootstrapping......");
  const { checkForImportExport } = await strapi.config.functions["dbTools"]();
  // check if export[=file] or import=file passed to cli
  await checkForImportExport(process.argv);
  console.log("no import/export passed to cli");
  console.log("starting strapi");
};
