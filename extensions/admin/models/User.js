"use strict";

/**
 * Lifecycle callbacks for the `Admin` model.
 */

const adminOrUser = "admin";

module.exports = {
  lifecycles: {
    async afterCreate(result, data) {
      console.log("afterCreate admin");
      strapi.config.functions["syncAdmins"](adminOrUser, "afterCreate", result);
    },
    async afterUpdate(result, params, data) {
      console.log("afterUpdate admin");
      strapi.config.functions["syncAdmins"](adminOrUser, "afterUpdate", {
        result,
        params,
        data,
        roles: data.roles
      });
    },
    async afterDelete(result, params) {
      console.log("afterDelete admin");
      strapi.config.functions["syncAdmins"](adminOrUser, "afterDelete", result);
    },
  },
};
