"use strict";

const { default: createStrapi } = require("strapi");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async afterCreate(data) {
      const email = data.created_by.email;
      console.log("set author id to be created_by");
      console.log({ email });
      const userId = (
        await strapi.plugins["users-permissions"].services.user.fetchAll()
      ).filter((user) => user.email === email)[0].id; //({ email }).id;
      console.log(userId);
      strapi.query("blog").update({ id: data.id }, { author: userId });
      //
    },
  },
};
