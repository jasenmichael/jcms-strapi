const ignoreTables = {
  global: [], // ["core_store", "strapi_role"],
  sqlite: ["sqlite_sequence"],
  mysql: [],
  // pg: [],
  // mongo: [],
  // mssql: [],
};
// deps
const bcrypt = require("bcryptjs");
const fs = require("fs");
// const { exec } = require("child_process");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

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
  const knexConfig = await getKnexConfig(env);
  const knex = require("knex")(knexConfig);
  const client = knexConfig.client.replace("sqlite3", "sqlite");
  //   console.log(client);
  //   console.log({ knexConfig });
  const dbName = knexConfig.connection.database;
  const tables = await listTables[client](knex, dbName).then((tables) => {
    return tables;
  });
  return tables;
};

const getTable = async (table) => {
  const knex = require("knex")(knexConfig);
  const tableData = await knex(table);
  knex.destroy();
  return tableData;
};

const getTablesData = async () => {
  const knexConfig = await getKnexConfig();
  const knex = require("knex")(knexConfig);
  const tablesList = await getTablesList();
  const tablesData = new Object();
  await Promise.all(
    tablesList.map(async (table) => {
      tablesData[table] = JSON.parse(JSON.stringify(await knex(table)));
    })
  );
  knex.destroy();
  return tablesData;
};

const checkForImportExport = async (argv) => {
  if (
    // import argument requires file
    argv.filter((arg) => arg.includes("import")).length &&
    !argv.filter((arg) => arg.includes("import=")).length
  ) {
    console.log("no import file passed");
    console.log("usage: import=[path-to].tables.json");
    console.log(" NODE_ENV=[env] npm run develop import=[path-to].tables.json");
    process.exit(0);
  }

  const importDataFile = argv.filter((arg) => arg.includes("import=")).length
    ? argv.filter((arg) => arg.includes("import="))[0].split("=")[1]
    : false;
  const exportDataFile =
    argv.filter((arg) => arg.includes("export")).length &&
    !argv.filter((arg) => arg.includes("import=")).length
      ? argv.filter((arg) => arg.includes("export=")).length
        ? argv.filter((arg) => arg.includes("export="))[0].split("=")[1]
        : "default"
      : false;
  // };
  if (importDataFile || exportDataFile) {
    await importExport(importDataFile, exportDataFile);
  }
};

const importExport = async (importDataFile, exportDataFile) => {
  console.log("================================");
  // importData
  if (importDataFile && !exportDataFile) {
    console.log("RUNNING IMPORT DATA");
    await importFile(importDataFile);
    process.exit(0);
  }
  // exportData
  if (exportDataFile && !importDataFile) {
    console.log("RUNNING EXPORT DATA");
    await exportFile(exportDataFile);
    console.log("================================");
    process.exit(0);
  }
  // can't run both import and export
  if (importDataFile && exportDataFile) {
    console.log("can't run both import and export");
    console.log("================================");
    process.exit(0);
  }
};

const importFile = async (file) => {
  console.log("import", file);
  const knexConfig = await getKnexConfig();
  const knex = require("knex")(knexConfig);
  const dumpFile = file.replace("tables.json", "dump.json");
  const tablesImportData = JSON.parse(
    fs.readFileSync(file, { encoding: "utf8" })
  );
  // check import tables and dump files exist
  if (!fs.existsSync(file) || !fs.existsSync(dumpFile)) {
    console.log(`import files do not exist..`);
    process.exit(0);
  }
  const dbName =
    knexConfig.connection.database || knexConfig.connection.filename;

  // empty or delete and recreate database.
  try {
    // do stuff to db
    const tablesList = await getTablesList();
    await Promise.all(
      tablesList.map(async (table) => {
        await knex(table)
          .then((rows) => {
            dbRows = JSON.parse(JSON.stringify(rows));
            dbRows.map(async (dbRow) => {
              const replaceData = tablesImportData[table].filter(
                (importRow) => importRow.id === dbRow.id
              )[0];
              if (replaceData) {
                await knex(table).where({ id: dbRow.id }).update(replaceData);
              }
            });
          })
          .catch((error) => {
            console.log(error);
          });
      })
    );
    await restoreDump();
    console.log("dump restored..");
    await doImportData();
    console.log("import tables into sqlite3 complete...");
  } catch (error) {
    console.log(error);
  }
  // if (knexConfig.client === "sqlite3") {
  //   try {
  //     // do sqlite stuff
  //     // const tablesData = await getTablesData();
  //     const tablesList = await getTablesList();
  //     await Promise.all(
  //       tablesList.map(async (table) => {
  //         await knex(table).then((rows) => {
  //           console.log({ rows });
  //         });
  //       })
  //     );
  //     await restoreDump();
  //     console.log("dump restored..");
  //     await doImportData();
  //     console.log("import tables into sqlite3 complete...");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  // if (knexConfig.client === "mysql") {
  //   try {
  //     // do msql stuff
  //     await restoreDump();
  //     console.log("dump restored..");
  //     await doImportData();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  async function restoreDump() {
    const env = strapi.config.environment;
    try {
      const { stdout, stderr } = await exec(
        `NODE_ENV=${env} npm run strapi configuration:restore < ${dumpFile}`
      );
      if (!stderr && stdout) {
        console.log(stdout);
        return;
      }
    } catch (error) {
      console.log("error retoring dump");
      console.log(error);
      process.exit(0);
    }
  }

  // delete all rows in each table from import file
  async function doImportData() {
    const tablesImportList = Object.keys(tablesImportData);
    return await Promise.all(
      tablesImportList.map(async (importTable) => {
        // console.log(importTable);
        const rows = tablesImportData[importTable];
        if (rows.length) {
          try {
            return await knex(importTable)
              .insert(rows)
              .then(() => {
                console.log(`SUCCESS insert rows ${importTable}`);
                return;
              });
          } catch (error) {
            // console.log(`failed insert rows into ${importTable}`, error.code);
            return await Promise.all(
              rows.map(async (row) => {
                try {
                  return await knex(importTable)
                    .insert(row)
                    .then(() => {
                      console.log(`SUCCESS insert row into ${importTable}`);
                      return;
                    });
                } catch (error) {
                  // console.log(`FAILED  insert row ${importTable}`, error.code);
                  return await knex(importTable)
                    .where({ id: row.id })
                    .update(row)
                    .then(() => {
                      console.log(
                        `SUCCESS update row ${row.id} ${importTable}`
                      );
                      return;
                    })
                    .catch(async (error) => {
                      console.log(
                        `FAILED  update row ${row.id} ${importTable} ${error.code}`
                      );
                      await doImportData();
                      return;
                    });
                }
              })
            );
          }
        }
      })
    );
  }
};

const exportFile = async (file) => {
  const env = strapi.config.environment;
  const date = new Date();
  const now =
    new Date(date).toISOString().split("T")[0] +
    `-${new Date(date).toLocaleTimeString("en-US").replace(" ", "")}`;
  const dumpFile =
    file !== "default"
      ? `exports/${file.replace(".json", "")}.dump.json`
      : `exports/export-${env}-${now}.dump.json`;
  const tablesFile =
    file !== "default"
      ? `exports/${file.replace(".json", "")}.tables.json`
      : `exports/export-${env}-${now}.tables.json`;

  try {
    // run strapi dump
    console.log(`Exporting tables to ${tablesFile}`);
    console.log(`Exporting dump to ${dumpFile}`);
    await exec(`npm run strapi configuration:dump -p > ${dumpFile}`);
    // read the dumpfile
    const dumpString = await fs.readFileSync(dumpFile, {
      encoding: "utf8",
    });
    // clean dump file - remove log that was prepended to the top
    const cleanedDumpString = JSON.parse(`[{` + dumpString.split(/\[{(.+)/)[1]);
    // write cleaned dump
    await fs.writeFileSync(
      dumpFile,
      JSON.stringify(cleanedDumpString, null, 2)
    );
    // write tablesData to dataFile
    const knexConfig = await getKnexConfig();
    const knex = require("knex")(knexConfig);
    const tablesData = await getTablesData(knex);
    fs.writeFileSync(tablesFile, JSON.stringify(tablesData, null, 2));
    console.log("SUCCESS!");
    console.log("import like so..");
    console.log(`NODE_ENV=production npm run develop import=${tablesFile}`);
  } catch (error) {
    console.log(error.stderr);
  }
  return;
};

module.exports = async () => {
  const knexConfig = await getKnexConfig();
  const knex = require("knex")(knexConfig);
  const Knex = require("knex");
  const tablesList = await getTablesList();
  const tablesData = await getTablesData(knex);
  return {
    knexConfig,
    knex,
    Knex,
    getTablesList,
    tablesList,
    getTable,
    getTablesData,
    checkForImportExport,
    tablesData,
    importExport,
    importFile,
    exportFile,
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
    connection.multipleStatements = true;
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
        multipleStatements: true,
      },
      useNullAsDefault: true,
    };
  },
  /*
    pgSettings() {
      return {
        client: "pg",
        connection: process.env.DATABASE_URL,
        searchPath: "knex,public",
        pool: { min: 0, max: 7 },
      };
    },
  todo:
  mongo
  mssql
  */
};
const listTables = {
  mysql: async (knex, dbName) => {
    // const query = `SELECT * FROM information_schema.tables`;
    const query = `SHOW TABLES`;
    return await knex.raw(query).then((db) => {
      const tables = db[0]
        .map((table) => table[`Tables_in_${dbName}`])
        .filter(
          (table_) =>
            ![...ignoreTables.global, ...ignoreTables["mysql"]].includes(table_)
        )
        .sort();
      //   console.log({ tables });
      knex.destroy();
      return tables;
    });
  },
  sqlite: async (knex) => {
    const tables = await knex("sqlite_master")
      .where("type", "table")
      .then((table) => table.map((table) => table.tbl_name));
    //   console.log({ tables });
    knex.destroy();
    return tables
      .filter(
        (table_) =>
          ![...ignoreTables.global, ...ignoreTables["sqlite"]].includes(table_)
      )
      .sort();
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

// todo
const getDbSettingByEnv = async (env) => {
  console.log("get dbsettings from env", env);
  const settings = await require(`/config/env/${env}/database.js`)();
  console.log(settings);
  return settings;
};
