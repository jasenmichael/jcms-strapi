require("dotenv").config();

const init = async (adminOrUser, lifecycle, adminOrUserData) => {
  const knex = require("knex")({
    client: "mysql",
    requestTimeout: 2000,
    charset: "utf8",
    //  connection: `mysql://${user}:${password}@${host}:${port}/${database}`,
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      ssl: process.env.DATABASE_SSL === "true" || null,
    },
  });
  const tables = [
    "strapi_administrator", // cms admins - contains password, user-id
    "strapi_role", // cms admin roles - contains role-id
    "strapi_users_roles", // cms admin users - contains user-id and rol-id
    "users-permissions_role",
    "users-permissions_user", // contains pass and role-id
  ];
  let tableData = new Object();
  await Promise.all(
    tables.map(async (table) => {
      try {
        let thisTableData = await getDbTable(table, knex);
        // console.log(thisTableData);
        tableData[table] = thisTableData;
      } catch (error) {
        console.log(error);
      }
    })
  );

  console.log({ adminOrUser, lifecycle, adminOrUserData });
  console.log("=========================");

  // admin-users - only for cms users - when admin user created via cms ui
  if (adminOrUser === "admin") {
    // MODEL {id,firstname,lastname,username,email,password,resetPasswordToken,registrationToken,isActive,blocked,roles}
    // since we are syncing to user, set users, and get the user by email
    const users = tableData["users-permissions_user"];
    const user = getUser(adminOrUserData.email, users, knex);
    const userRoles = tableData["users-permissions_role"];
    // createAdmin || updateAdmin
    if (["afterCreate", "afterUpdate"].indexOf(lifecycle >= 0)) {
      //    - check if user exist and update, or create user
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
    // deleteAdmin
    if (lifecycle === "afterDelete") {
      console.log("DELETE", adminOrUserData);
      await Promise.all(
        adminOrUserData.forEach(async (admin) => {
          console.log("deleting.....", admin.email);
          await deleteUser(admin.email, knex);
        })
      );
    }
  }

  // users - only for api users(but if role = editor, create admin editor)
  if (adminOrUser === "user") {
    // MODEL {id,username,email,provider,password,resetPasswordToken,confirmationToken,confirmed,blocked,role,created_by,updated_by,created_at,updated_at,profile_image}
    // createUser || updateUser
    //  - if role administrator - sync user to admin, set role to administrator
    // deleteUser
    //  - if admin user exist - delete the admin user
  }

  console.log("closing db connection");
  knex.destroy();
  return;
};

const getDbTable = async (table, knex) => {
  return await knex
    .select()
    .from(table)
    .then((row) => {
      return row.map((role) => JSON.parse(JSON.stringify(role)));
    })
    .catch((error) => console.log(error));
};

const getAdmin = () => {};
const getAdminIdByUserEmail = (userEmail, admins) => {};
const createAdmin = () => {};
const updateAdmin = () => {};
const deleteAdmin = () => {};
const syncAdminToUser = () => {};

const getUser = (email, users) => {
  console.log(`checking if user with email - ${email}`);
  const userFound = users.filter((user) => user.email === email).length === 1;
  console.log(userFound);
  if (userFound) {
    return users.filter((user) => user.email === email)[0];
  } else {
    return userFound;
  }
};
const getUserIdByAdminEmail = (adminEmail, users) => {
  console.log({ users });
  const id = users.filter((user) => {
    return user.email === adminEmail;
  })[0].id;
  console.log({ id });
  // process.exit()
  return id;
  // return 1;
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
    console.log("use email", email, "not found, not deleting");
  }
};
const syncUserToAdmin = () => {};

module.exports = async (adminOrUser, lifecycle, user) => {
  console.log("RUNNING syncAdmins");
  await init(adminOrUser, lifecycle, user);
  // return {
  //   init,
  // };
};
