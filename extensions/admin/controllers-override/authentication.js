"use strict";

const passport = require("koa-passport");
const compose = require("koa-compose");

const {
  validateRegistrationInput,
  validateAdminRegistrationInput,
  validateRegistrationInfoQuery,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} = require("../validation/authentication");
const { flushSync } = require("react-dom");

module.exports = {
  login: compose([
    (ctx, next) => {
      return passport.authenticate(
        "local",
        { session: false },
        async (err, user, info) => {
          console.log({ err, user, info });
          console.log(ctx.request.body);

          // @jasenmichael
          // custom admin login with user provider
          if (
            ctx.request.header.referer.split("?")[0] ===
              strapi.config.server.frontendUrl + "/auth" &&
            !user &&
            !err &&
            info.message === "Invalid credentials"
          ) {
            const provider =
              ctx.request.header.referer.includes("?") &&
              ctx.request.header.referer.includes("&")
                ? ctx.request.header.referer.split("?")[1].split("&")[0]
                : null;
            const email = ctx.request.body.email || null;
            const newUser =
              (await strapi.query("user", "users-permissions").findOne({
                email,
              })) || null;
            console.log({ newUser });
            const userIsEditor = newUser.role.type === "editor";

            if (provider && email && newUser && userIsEditor) {
              console.log({ err });
              console.log({ user });
              console.log({ info });
              console.log(ctx.request.body);
              console.log(strapi.config.server.frontendUrl);

              const admin = (await strapi.query("user", "admin").find()).filter(
                (admin) => admin.email === email
              )[0];

              ctx.state.user = admin;

              strapi.eventHub.emit("admin.auth.success", {
                user: admin,
                provider,
              });

              return next();
            }
          }
          // custom admin login with user provider

          if (err) {
            strapi.eventHub.emit("admin.auth.error", {
              error: err,
              provider: "local",
            });
            return ctx.badImplementation();
          }

          if (!user) {
            strapi.eventHub.emit("admin.auth.error", {
              error: new Error(info.message),
              provider: "local",
            });
            return ctx.badRequest(info.message);
          }

          ctx.state.user = user;

          strapi.eventHub.emit("admin.auth.success", {
            user,
            provider: "local",
          });

          return next();
        }
      )(ctx, next);
    },
    (ctx) => {
      const { user } = ctx.state;

      ctx.body = {
        data: {
          token: strapi.admin.services.token.createJwtToken(user),
          user: strapi.admin.services.user.sanitizeUser(ctx.state.user), // TODO: fetch more detailed info
        },
      };
    },
  ]),

  renewToken(ctx) {
    const { token } = ctx.request.body;

    if (token === undefined) {
      return ctx.badRequest("Missing token");
    }

    const { isValid, payload } = strapi.admin.services.token.decodeJwtToken(
      token
    );

    if (!isValid) {
      return ctx.badRequest("Invalid token");
    }

    ctx.body = {
      data: {
        token: strapi.admin.services.token.createJwtToken({ id: payload.id }),
      },
    };
  },

  async registrationInfo(ctx) {
    try {
      await validateRegistrationInfoQuery(ctx.request.query);
    } catch (err) {
      return ctx.badRequest("QueryError", err);
    }

    const { registrationToken } = ctx.request.query;

    const registrationInfo = await strapi.admin.services.user.findRegistrationInfo(
      registrationToken
    );

    if (!registrationInfo) {
      return ctx.badRequest("Invalid registrationToken");
    }

    ctx.body = { data: registrationInfo };
  },

  async register(ctx) {
    const input = ctx.request.body;

    try {
      await validateRegistrationInput(input);
    } catch (err) {
      return ctx.badRequest("ValidationError", err);
    }

    const user = await strapi.admin.services.user.register(input);

    ctx.body = {
      data: {
        token: strapi.admin.services.token.createJwtToken(user),
        user: strapi.admin.services.user.sanitizeUser(user),
      },
    };
  },

  async registerAdmin(ctx) {
    const input = ctx.request.body;

    try {
      await validateAdminRegistrationInput(input);
    } catch (err) {
      return ctx.badRequest("ValidationError", err);
    }

    const hasAdmin = await strapi.admin.services.user.exists();

    if (hasAdmin) {
      return ctx.badRequest("You cannot register a new super admin");
    }

    const superAdminRole = await strapi.admin.services.role.getSuperAdmin();

    if (!superAdminRole) {
      throw new Error(
        "Cannot register the first admin because the super admin role doesn't exist."
      );
    }

    const user = await strapi.admin.services.user.create({
      ...input,
      registrationToken: null,
      isActive: true,
      roles: superAdminRole ? [superAdminRole.id] : [],
    });

    await strapi.telemetry.send("didCreateFirstAdmin");

    ctx.body = {
      data: {
        token: strapi.admin.services.token.createJwtToken(user),
        user: strapi.admin.services.user.sanitizeUser(user),
      },
    };
  },

  async forgotPassword(ctx) {
    const input = ctx.request.body;

    try {
      await validateForgotPasswordInput(input);
    } catch (err) {
      return ctx.badRequest("ValidationError", err);
    }

    strapi.admin.services.auth.forgotPassword(input);

    ctx.status = 204;
  },

  async resetPassword(ctx) {
    const input = ctx.request.body;

    try {
      await validateResetPasswordInput(input);
    } catch (err) {
      return ctx.badRequest("ValidationError", err);
    }

    const user = await strapi.admin.services.auth.resetPassword(input);

    ctx.body = {
      data: {
        token: strapi.admin.services.token.createJwtToken(user),
        user: strapi.admin.services.user.sanitizeUser(user),
      },
    };
  },
};
