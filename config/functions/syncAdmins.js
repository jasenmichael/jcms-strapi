// "strapi_administrator", // cms admins - contains password, user-id
// "strapi_role", // cms admin roles - contains role-id
// "strapi_users_roles", // cms admin users - contains user-id and rol-id
// "users-permissions_role",
// "users-permissions_user", // contains pass and role-id

const init = async (adminOrUser, lifecycle, adminOrUserData) => {
  const { knex } = await strapi.config.functions["dbTools"]();
  console.log({ adminOrUser, lifecycle, adminOrUserData });
  // console.log({ adminOrUser, lifecycle, adminOrUserData });
  console.log("================================");

  // =========== ADMIN sync to USER  ===================
  // admin-users - only for cms users - when admin user created via cms ui
  if (adminOrUser === "admin") {
    const userRoles = await getDbTable("users-permissions_role", knex);

    // beforeUpdate Admin - update user email to be the changed email, so afterUpdate, can find by email.
    if (lifecycle === "beforeUpdate") {
      const users = await getDbTable("users-permissions_user", knex);
      const admins = await getDbTable("strapi_administrator", knex);

      // get admin email before update
      const beforeAdminEmail = admins.filter(
        (admin) => admin.id.toString() === adminOrUserData.id.toString()
      )[0].email;
      console.log({ beforeAdminEmail });
      const user = await getUser(beforeAdminEmail, users);
      // if email changed, update user email
      console.log({ user });
      if (user.email === beforeAdminEmail) {
        // update user to have new email
        console.log("Email matches user, updating with admin email");
        await knex("users-permissions_user")
          .where({ id: user.id })
          .update({ email: adminOrUserData.email });
        // await knex.destroy();
        // return;
      }
    }

    // afterCreate || afterUpdate Admin - create/update User - when user created via cms or api
    if (
      ["afterCreate", "afterUpdate"].includes(lifecycle) &&
      lifecycle !== "afterDelete"
    ) {
      // reload users incase email changed
      const users = await getDbTable("users-permissions_user", knex);
      const user = await getUser(adminOrUserData.email, users);

      // create user with adminOrUserData
      if (!user) {
        console.log(
          `user with email "${adminOrUserData.email}" DOES NOT exist`
        );
        console.log("creating user", adminOrUserData.email);
        await createUser(adminOrUserData, userRoles, knex);

        // update user with adminOrUserData
      } else {
        console.log(`user with email "${adminOrUserData.email}" exist`);
        console.log("updating user", adminOrUserData.email);
        // tableData["users-permissions_role"]
        await updateUser(user, adminOrUserData, userRoles, knex);
      }
    }
    // afterDelete Admin - delete User
    if (lifecycle === "afterDelete") {
      console.log("DELETE", adminOrUserData);
      // await deleteUser(adminOrUserData[0].email, knex);
      await Promise.all(
        adminOrUserData.map(async (admin) => {
          console.log("deleting.....", admin.email);
          try {
            await deleteUser(admin.email, knex);
          } catch (error) {
            console.log(error);
          }
        })
      );
    }
  }

  // =========== USER sync to ADMIN ===================
  // users - only for api users(but if role = editor, create/update admin editor),
  // if role not editor, and admin exist delete admin
  if (adminOrUser === "user") {
    if (lifecycle === "beforeUpdate") {
      const users = await getDbTable("users-permissions_user", knex);
      const admins = await getDbTable("strapi_administrator", knex);
      // get user email before update
      const beforeUserEmail = users.filter(
        (user) => user.id.toString() === adminOrUserData.id.toString()
      )[0].email;
      const admin = getAdmin(beforeUserEmail, admins);

      if (admin.email === beforeUserEmail) {
        // update admin to have new email
        await knex("strapi_administrator")
          .where({ id: admin.id })
          .update({ email: adminOrUserData.email });
      }
    }

    // afterCreate || afterUpdate Admin
    if (["afterCreate", "afterUpdate"].includes(lifecycle)) {
      let admins = await getDbTable("strapi_administrator", knex);
      let admin = getAdmin(adminOrUserData.email, admins);
      let adminRoles = await getDbTable("strapi_role", knex);
      const adminsRoles = await getDbTable("strapi_users_roles", knex);
      const userRoles = await getDbTable("users-permissions_role", knex);
      const editorRoleId = userRoles.filter((role) => role.name === "Editor")[0]
        .id;
      const isEditor = adminOrUserData.role.id === editorRoleId;

      console.log(`editor ${isEditor}`);

      // user is editor, admin not exist so create
      if (!admin && isEditor) {
        console.log(
          `admin with email "${adminOrUserData.email}" DOES NOT exist`
        );
        console.log("creating admin", adminOrUserData.email);
        // when create admin, also create strapi_users_roles
        await createAdmin(
          adminOrUserData,
          admins,
          adminRoles,
          adminsRoles,
          knex
        );
        admins = await getDbTable("strapi_administrator", knex);
        admin = getAdmin(adminOrUserData.email, admins);
      }

      // afterUpdate - user is editor, update admin with adminOrUserData
      if (admin && isEditor && lifecycle === "afterUpdate") {
        console.log(`admin with email "${adminOrUserData.email}" exist, now updating`);
        // update admin, add editor role(if not exist)
        try {
          const adminEditorRoleId = adminRoles.filter(
            (role) => role.name === "Editor"
          )[0].id;
          // create admin role with editor role id, and admin id
          await knex("strapi_administrator")
            .where({ id: admin.id })
            .update({
              firstname: admin.firstname || userData.username || " ",
              lastname: admin.lastname || " ",
              username: adminOrUserData.username,
              email: adminOrUserData.email,
              password: adminOrUserData.password,
              resetPasswordToken: adminOrUserData.resetPasswordToken,
              registrationToken: adminOrUserData.confirmed ? null : adminOrUserData.confirmationToken,
              isActive: adminOrUserData.confirmed ? 1 : 0,
              blocked: adminOrUserData.blocked || null,
            });

          await knex("strapi_users_roles").insert({
            user_id: admin.id,
            role_id: adminEditorRoleId,
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        // admin exist, but not editor(possibly just removed)
        if (lifecycle === "afterUpdate") {
          try {
            console.log(`user not editor, admin exist ${admin ? true : false}`);
            // delete admin role with admin.id
            console.log("removing editor role if exist for admin");
            adminRoles = await getDbTable("strapi_role", knex);
            console.log({ adminRoles });
            const adminEditorRoleId = adminRoles.filter(
              (role) => role.name === "Editor"
            )[0].id;
            await knex("strapi_users_roles")
              .where({ user_id: admin.id, role_id: adminEditorRoleId })
              .del();
            // if admin has no admin roles, delete admin
            const adminHasRoles =
              (await knex("strapi_users_roles").where({ user_id: admin.id }))
                .length || false;
            if (!adminHasRoles) {
              console.log("admin user has no admin roles, deleting admin");
              await knex("strapi_administrator").where({ id: admin.id }).del();
            }

            console.log({ adminHasRoles });
          } catch (error) {}
        }
      }
    }
    // afterDelete User - if admin exist, delete the admin
    if (lifecycle === "afterDelete") {
      // const admins = await getDbTable("strapi_administrator", knex);
      await Promise.all(
        adminOrUserData.map(async (admin) => {
          console.log("deleting admin", admin.email);
          try {
            console.log(`admin exist ${admin ? true : false}`);
            // delete admin role with admin.id
            console.log("removig editor role if exist for admin");
            adminRoles = await getDbTable("strapi_role", knex);
            console.log({ adminRoles });
            const adminEditorRoleId = adminRoles.filter(
              (role) => role.name === "Editor"
            )[0].id;
            await knex("strapi_users_roles")
              .where({ user_id: admin.id, role_id: adminEditorRoleId })
              .del();
            // if admin has no admin roles, delete admin
            const adminHasRoles =
              (await knex("strapi_users_roles").where({ user_id: admin.id }))
                .length || false;
            if (!adminHasRoles) {
              console.log("admin user has no admin roles, deleting admin");
              await knex("strapi_administrator").where({ id: admin.id }).del();
            }

            console.log({ adminHasRoles });
          } catch (error) {
            console.log(error);
          }
        })
      );
    }
  }
  console.log("closing db connection");
  knex.destroy();
  console.log("=========================");
  return;
};

const getDbTable = async (table, knex) => {
  return await knex
    .select()
    .from(table)
    .then((row) => {
      return row.map((row) => JSON.parse(JSON.stringify(row)));
    })
    .catch((error) => console.log(error));
};

const getAdmin = (email, admins) => {
  // console.log(`checking if admin with email - ${email}`);
  const adminFound =
    admins.filter((admin) => admin.email === email).length === 1;
  // console.log("admin found:", adminFound);
  if (adminFound) {
    return admins.filter((admin) => admin.email === email)[0];
  } else {
    return adminFound;
  }
};
const getAdminIdByUserEmail = (userEmail, admins) => {
  return admins.filter((admin) => admin.email === userEmail)[0].id;
};
const createAdmin = async (userData, admins, adminRoles, adminsRoles, knex) => {
  console.log("======");
  console.log({ userData, adminRoles, adminsRoles, admins });
  // check if user has editor user role and create admin

  // get
  console.log("======");
  const admin = {
    id: userData.id,
    firstname: userData.username || " ",
    lastname: " ",
    username: userData.username,
    email: userData.email,
    password: userData.password,
    resetPasswordToken: userData.resetPasswordToken,
    registrationToken: userData.confirmationToken,
    isActive: userData.confirmed ? 1 : 0,
    blocked: userData.blocked || null,
  };
  // create admin, get new id, get editor role id
  try {
    const newAdminId = await knex("strapi_administrator").insert(admin);
    // const newAdmin = await knex("strapi_administrator").where({ id: newAdminId });
    const adminEditorRoleId = adminRoles.filter(
      (role) => role.name === "Editor"
    )[0].id;
    // create admin role with editor role id, and admin id
    await knex("strapi_users_roles").insert({
      user_id: newAdminId,
      role_id: adminEditorRoleId,
    });
  } catch (error) {
    console.log(error);
  }
};
const updateAdmin = () => {};
const deleteAdmin = () => {};

const getUser = async (email, users) => {
  const userFound =
    (await users.filter((user) => user.email === email).length) === 1;
  if (userFound) {
    return await users.filter((user) => user.email === email)[0];
  } else {
    return userFound;
  }
};
const getUserIdByAdminEmail = (adminEmail, users) => {
  return users.filter((user) => user.email === adminEmail)[0].id;
};
const createUser = async (adminData, usersRoles, knex) => {
  const role = usersRoles.filter((role) => role.name === "Editor")[0].id;
  const user = {
    username: adminData.username || adminData.firstname,
    email: adminData.email,
    provider: "local",
    password: adminData.password,
    resetPasswordToken: adminData.resetPasswordToken,
    confirmationToken: adminData.registrationToken,
    confirmed: adminData.registrationToken ? 0 : 1,
    blocked: adminData.blocked === null ? 0 : 1,
    role,
    created_by: 1,
    updated_by: 1,
  };

  try {
    await knex("users-permissions_user").insert(user);
    return;
  } catch (error) {
    console.log(error);
  }
};
const updateUser = async (userData, adminData, usersRoles, knex) => {
  const role = usersRoles.filter((role) => role.name === "Editor")[0].id;
  const users = await getDbTable("users-permissions_user", knex);

  try {
    await knex("users-permissions_user")
      .where({ id: userData.id })
      .update({
        ...userData,
        // id: 1,
        username: adminData.username || adminData.firstname,
        email: adminData.email,
        // provider: "local",
        password: adminData.password,
        resetPasswordToken: adminData.resetPasswordToken,
        confirmationToken: adminData.registrationToken,
        confirmed: adminData.registrationToken ? 1 : 0,
        blocked: adminData.blocked === null ? 0 : 1,
        role,
        // created_by: 1,
        updated_by: getUserIdByAdminEmail(adminData.email, users), // 1,
        created_at: userData.created_at.replace("T", " ").replace("0Z", " "),
        updated_at: new Date(),
      });
    return;
  } catch (error) {
    console.log(error);
  }
};
const deleteUser = async (email, knex) => {
  const users = await getDbTable("users-permissions_user", knex);
  const id = getUserIdByAdminEmail(email, users); // 1,
  const user = getUser(email, users);
  if (user) {
    console.log("deleting user email", email);
    try {
      await knex("users-permissions_user").where({ id }).del();
      return;
    } catch (error) {
      console.log("error deleting", error);
    }
  } else {
    console.log("user email", email, "not found, not deleting");
  }
};

module.exports = async (adminOrUser, lifecycle, user) => {
  console.log(`RUNNING syncAdmins ${adminOrUser} ${lifecycle}`);
  await init(adminOrUser, lifecycle, user);
  // return {
  //   init,
  // };
};
