import fs from "fs/promises";

import { DB_FOLDER, TRANSLATION_TABLES, VERSION } from "../constants.js";
import { getSingular } from "../utils.js";
import { debug, log } from "console";

const SPECIAL_NAMES = ["character", "language"];
const OUTPUT_PATH = `./${DB_FOLDER}/${VERSION}/data/sql`;

/**
 * Main script to convert json files into sqls
 */
async function main() {
  const path = `./${DB_FOLDER}/${VERSION}/data`;
  const files = await fs.readdir(path, {
    recursive: false,
  });

  // Create the folder path
  await fs.mkdir(OUTPUT_PATH, { recursive: true });
  // Clear current file (if any)
  await fs.writeFile(`${OUTPUT_PATH}/hawapi.sql`, "");

  let queries = [];
  for (const index in files) {
    let target = files[index];
    if (!(await fs.stat(`${path}/${target}`)).isDirectory()) {
      // Remove file extension
      target = target.substring(0, target.lastIndexOf("."));

      let data = await fs.readFile(
        `./${DB_FOLDER}/${VERSION}/data/${target}.json`
      );
      data = JSON.parse(data);

      for (const item in data) {
        const uuid = data[item]["uuid"];

        let { fields, values, subQueries } = query(target, data[item]);

        if (TRANSLATION_TABLES.includes(target)) {
          let res = await translationQuery(target, uuid);
          subQueries.push(...res);
        }

        let sqlQuery =
          `INSERT INTO ${target} (` + fields + ") VALUES (" + values + ");\n";

        queries.push(sqlQuery, ...subQueries);
      }
    }
  }

  debug(process.memoryUsage());
  await fs.writeFile(`${OUTPUT_PATH}/hawapi.sql`, queries);

  log(
    `Converted '${path}' files into SQL (Output: '${OUTPUT_PATH}/hawapi.sql')`
  );
}

const translationQuery = async (target, uuid) => {
  let data = await fs.readFile(
    `./${DB_FOLDER}/${VERSION}/data/translations/${target}_translations.json`
  );
  data = JSON.parse(data);

  let res = [];
  for (const item in data) {
    if (data[item][`${getSingular(target)}_uuid`] === uuid) {
      let { fields, values } = query(target, data[item]);

      let sqlQuery =
        `INSERT INTO ${target}_translations (` +
        fields +
        ") VALUES (" +
        values +
        ");\n";

      res.push(sqlQuery);
    }
  }

  return res;
};

const subQuery = (target, fieldName, array) => {
  let res = "";
  for (const item in array) {
    // Ignore any possible array or non dictionary/map
    if (typeof array[item] !== "object" || Array.isArray(item)) return "";

    let { fields, values } = query(target, array[item]);

    res +=
      `INSERT INTO ${target}_${fieldName} (` +
      fields +
      ") VALUES (" +
      values +
      ");\n";
  }

  return res;
};

const query = (target, array) => {
  let subQueries = [];
  let fields = "";
  let values = "";

  for (const field in array) {
    let value = array[field];

    switch (typeof value) {
      case "string":
        values += `'${escapeSingleQuote(value)}', `;
        break;
      case "number":
      case "boolean":
        values += `${value}, `;
        break;
      case "object":
        if (Array.isArray(value)) {
          const res = subQuery(target, field, value);
          if (res !== "") {
            subQueries.push(res);
            continue;
          }
          values += `'${objectToPostgreSQLArray(value)}', `;
        }
        break;
    }

    if (SPECIAL_NAMES.includes(field)) {
      fields += `"${field}", `;
      continue;
    }

    fields += `${field}, `;
  }

  fields = fields.slice(0, -2);
  values = values.slice(0, -2);

  return {
    fields,
    values,
    subQueries,
  };
};

const objectToPostgreSQLArray = (array) => {
  let res = "{";
  for (const value in array) {
    res += `${array[value]}, `;
  }
  res = res.slice(0, -2);
  return res + "}";
};

const escapeSingleQuote = (value) => {
  return value.replace(/'/g, "''");
};

main();
