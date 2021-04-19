const getKnexConfig = async (env = null) => {
  const envConfig = env ? await getDbSettingByEnv(env) : null;
  const dbSettings =
    envConfig || strapi.config.database.connections.default.settings;
  //   console.log("dbSettings:", dbSettings);
  const client = dbSettings.client.replace("sqlite3", "sqlite");
  return await dbConfigs[client](dbSettings);
};

// returns array of tables in db
const getTablesList = async (env = null) => {
  const ignoreTables = {
    sqlite: ["sqlite_sequence"],
    mysql: [],
    // pg: [],
    // mongo: [],
    // mssql: [],
  };
  const knexConfig = await getKnexConfig(env);
  const knex = require("knex")(knexConfig);
  const client = knexConfig.client.replace("sqlite3", "sqlite");
  //   console.log(client);
  //   console.log({ knexConfig });
  const dbName = knexConfig.connection.database;
  const tables = await listTables[client](knex, dbName).then((tables) => {
    return tables.filter((table) => !ignoreTables[client].includes(table));
  });
  knex.destroy();
  return tables;
};

module.exports = async () => {
  const knexConfig = await getKnexConfig();
  const knex = require("knex")(knexConfig);
  return {
    knexConfig,
    knex,
    getTablesList,
    // getTable,
    yo: "yoyoy",
  };
};

const dbConfigs = {
  mysql(dbSettings) {
    dbSettings.user = dbSettings.username || dbSettings.user;
    dbSettings.port = dbSettings.port.toString();
    if (!dbSettings.ssl) {
      dbSettings.ssl = null;
    }
    // remove - username, filename, client from 'connection'
    const { username, filename, client, ...connection } = dbSettings;
    return {
      client,
      requestTimeout: 2000,
      charset: "utf8",
      connection,
    };
  },

  sqlite(dbSettings) {
    return {
      client: dbSettings.client,
      connection: {
        filename: dbSettings.filename,
      },
      useNullAsDefault: true,
    };
  },

  //   pgSettings() {
  //     return {
  //       client: "pg",
  //       connection: process.env.DATABASE_URL,
  //       searchPath: "knex,public",
  //       pool: { min: 0, max: 7 },
  //     };
  //   },

  // todo:
  // mongo
  // mssql
};

const listTables = {
  mysql: async (knex, dbName) => {
    // const query = `SELECT * FROM information_schema.tables`;
    const query = `SHOW TABLES`;
    return await knex.raw(query).then((db) => {
      const tables = db[0].map((table) => table[`Tables_in_${dbName}`]).sort();
      //   console.log({ tables });
      return tables;
    });
  },
  sqlite: async (knex) => {
    const tables = await knex("sqlite_master")
      .where("type", "table")
      .then((table) => table.map((table) => table.tbl_name));
    //   console.log({ tables });
    return tables.sort();
  },
  pg: (knex) => {
    // const query = `SELECT tablename FROM pg_tables WHERE schemaname='public'`;
    console.error("listTables.pg() not implemented yet");
    process.exit();
    //  knex('pg_catalog.pg_tables')
    //    .select('tablename')
    //    .where({schemaname:'public'})
  },
};

const getDbSettingByEnv = async (env) => {
  console.log("get dbsettings from env", env);
  const settings = await require(`/config/env/${env}/database.js`)();
  console.log(settings);
  return settings;
};
