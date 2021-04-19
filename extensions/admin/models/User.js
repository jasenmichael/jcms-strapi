"use strict";

/**
 * Lifecycle callbacks for the `Admin` model.
 */

const adminOrUser = "admin";

module.exports = {
  lifecycles: {
    async afterCreate(result, data) {
      console.log(`afterCreate ${adminOrUser}`);
      strapi.config.functions["syncAdmins"](adminOrUser, "afterCreate", result);
    },
    async beforeUpdate(result, params, data) {
      console.log(`beforeUpdate ${adminOrUser}`);
      console.log({ result, params, data });
      strapi.config.functions["syncAdmins"](adminOrUser, "beforeUpdate", {
        id: result.id,
        ...params,
      });
    },
    async afterUpdate(result, params, data) {
      console.log(`afterUpdate ${adminOrUser}`);
      strapi.config.functions["syncAdmins"](adminOrUser, "afterUpdate", result);
    },
    async afterDelete(result, params) {
      console.log(`afterDelete ${adminOrUser}`);
      strapi.config.functions["syncAdmins"](adminOrUser, "afterDelete", result);
    },
  },
};
