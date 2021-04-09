const fs = require("fs");

const dbHost = "10.14.72.111";
const dbPort = 3307;
const database = "jcms";
const dbUser = "strapi";
const dbPassword = "Strapi123456";

const init = async (adminOrUser, lifecycle, user) => {
  const knex = require("knex")({
    client: "mysql",
    requestTimeout: 2000,
    charset: "utf8",
    //  connection: `mysql://${user}:${password}@${host}:${port}/${database}`,
    connection: {
      host: dbHost,
      port: dbPort,
      database,
      user: dbUser,
      password: dbPassword,
      //   ssl: false,
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
  // console.log(tableData);
  // fs.writeFileSync("data.json", JSON.stringify(tableData, null, 2));
  
  console.log({ adminOrUser, lifecycle, user });
  console.log("=========================");
  // console.log({ lifecycle });
  // console.log({ user });

  // admin-users - only for cms users
  // MODEL {id,firstname,lastname,username,email,password,resetPasswordToken,registrationToken,isActive,blocked,roles}
  // createAdmin
  // updateAdmin
  //    - sync admin to user
  // deleteAdmin

  // users - only for api users(but synced to admins)
  // MODEL {id,username,email,provider,password,resetPasswordToken,confirmationToken,confirmed,blocked,role,created_by,updated_by,created_at,updated_at,profile_image}
  // createUser ||
  // updateUser
  //  - if role administrator - sync user to admin, set role to administrator
  // deleteUser
  //  - if admin user exist - delete the admin user

  // get strapi administrators adminstrator-roles
  // get users, user-roles, and user-permissions
  console.log("closing db connection");
  knex.destroy();
  return;
};

const getDbTable = async (table, knex) => {
  return await knex
    .select()
    .from(table)
    .then((strapiRoles) => {
      return strapiRoles.map((role) => JSON.parse(JSON.stringify(role)));
    })
    .catch((error) => console.log(error));
};

module.exports = async (adminOrUser, lifecycle, user) => {
  console.log("RUNNING syncAdmins");
  await init(adminOrUser, lifecycle, user);
  // return {
  //   init,
  // };
};
