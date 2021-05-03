const fetch = require("node-fetch");

module.exports = {
  // GET /content-types
  list: async (ctx) => {
    const contentTypes = Object.keys(strapi.api)
      // get all content names for single/collection
      .filter((name) => {
        // filter only have controllers, models, services, and config - hide custom
        return (
          strapi.api[name].controllers &&
          strapi.api[name].models &&
          strapi.api[name].services &&
          strapi.api[name].config
        );
      })
      // map title type and endpoint
      .map((name) => {
        return {
          title: strapi.api[name].models[name].info.name,
          type: strapi.api[name].models[name].kind.replace("Type", ""),
          endpoint:
            strapi.api[name].config.routes[0].path ||
            strapi.api[name].models[name].apiName,
        };
      });

    ctx.send([/*msg: ctx,*/ ...contentTypes /*{types: strapi.api}*/]);
  },
};
