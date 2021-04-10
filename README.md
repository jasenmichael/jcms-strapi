# JCMS

## customixed and tweaked strapi install

### Features:

customized cms ui
sync admin users with users
iframable cms ui
cms ui hidden sections based on roles

setup/config:
config/plugins.js // add dropbox providerOptions
config/server.js // move host, port, and jwt_secret to .env
config/functions/syncAdmins.js // sync ran from [user-permissions && strapi-admin]/models/User.js
extensions/admin/models/User.js // lifecycle hooks for strapi-admin model
extensions/users-permissions/models/User.js // lifecycle hooks for user model
public/index.html
utils/overrides.js // cutom script to override non-overrideable admin pages.

---

admin customizations:
admin/src/containers/HomePage/index.js
admin/src/containers/HomePage/components.js
admin/src/components/LeftMenu/LeftMenuLinkSection/index.js
admin/src/containers/Admin/Logout/index.js
admin/src/components/LeftMenu/LeftMenuHeader/index.js
admin/src/components/LeftMenu/LeftMenuHeader/Wrapper.js
admin/src/components/LeftMenu/LeftMenuLinkSection/EmptyLinksList.js
admin/src/components/LeftMenu/LeftMenuLinkSection/LeftMenuListLink.js
admin/src/containers/AuthPage/components/Register/index.js
