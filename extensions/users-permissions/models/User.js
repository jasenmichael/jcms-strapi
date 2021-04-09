"use strict";

/**
 * Lifecycle callbacks for the `User` model.
 */

 const adminOrUser = "user"


module.exports = {
  lifecycles: {
    async afterCreate(result, data) {
      console.log("afterCreate user");
      strapi.config.functions["syncAdmins"](adminOrUser, "afterCreate", result);
    },
    async afterUpdate(result, params, data) {
      console.log("afterUpdate user");
      strapi.config.functions["syncAdmins"](adminOrUser, "afterUpdate", result);
    },
    async afterDelete(result, params) {
      console.log("afterDelete user");
      strapi.config.functions["syncAdmins"](adminOrUser, "afterDelete", result);
    },
  },
};
