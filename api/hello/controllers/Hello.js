const fetch = require("node-fetch");

module.exports = {
  // GET /hello
  index: async (ctx) => {
    const contentTypes = Object.keys(strapi.api)
      // get all content names for single/collection
      .filter((name) => {
        const contentType = strapi.api[name];
        console.log(contentType);
        return (
          contentType.controllers &&
          contentType.models &&
          contentType.services &&
          contentType.config
        );
      })
      // map title type and endpoint
      .map((name) => {
        return {
          // [name]: {
          // data: strapi.api[name],
          title: strapi.api[name].models[name].info.name,
          type: strapi.api[name].models[name].kind.replace("Type", ""),
          endpoint: strapi.api[name].models[name].apiName,
          // },
        };
      })
      // map public content
      // .map(async (item) => {
      //   item.data = await fetch(`${process.env.BACKEND_URL}/hello`, { method: "GET", redirect: "follow" })
      //     .then((res) => {
      //       return JSON.parse(res);
      //     })
      //     // .then(result => console.log(result))
      //     .catch((err) => {
      //       // console.log("error", err);
      //       return {private: true}
      //     });
      //   return item;
      // });
    // filter non-public content

    console.log(contentTypes);
    ctx.send([/*msg: ctx,*/ ...contentTypes /*{types: strapi.api}*/]);
  },
};
