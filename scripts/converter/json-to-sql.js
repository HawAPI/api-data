import fs from "fs/promises";

import { DB_FOLDER, TRANSLATION_TABLES, VERSION } from "../constants.js";
import { getSingular } from "../utils.js";
import { log } from "console";

const SPECIAL_NAMES = ["character", "language"];
const BASE_PATH = `./${DB_FOLDER}/${VERSION}/data`;
const OUTPUT_PATH = `${BASE_PATH}/sql`;

/**
 * Main script to convert json files into sqls
 */
async function main() {
  const files = await fs.readdir(BASE_PATH, {
    recursive: false,
  });

  // Create the folder path
  await fs.mkdir(OUTPUT_PATH, { recursive: true });
  // Clear current file (if any)
  await fs.writeFile(`${OUTPUT_PATH}/hawapi.sql`, "");

  let queries = [];
  for (let target of files) {
    if (!(await fs.stat(`${BASE_PATH}/${target}`)).isDirectory()) {
      // Remove file extension
      target = target.substring(0, target.lastIndexOf("."));

      let data = await getJsonFile(target, false);

      for (const item of data) {
        let { fields, values, subQueries } = query(target, item);

        if (TRANSLATION_TABLES.includes(target)) {
          let res = await translationQuery(target, item.uuid);
          subQueries.push(...res);
        }

        let sqlQuery =
          `INSERT INTO ${target} (` + fields + ") VALUES (" + values + ");\n";

        queries.push(sqlQuery, ...subQueries);
      }
    }
  }

  await fs.writeFile(`${OUTPUT_PATH}/hawapi.sql`, queries);

  log(
    `Converted '${BASE_PATH}' files into SQL (Output: '${OUTPUT_PATH}/hawapi.sql')`
  );
}

/**
 * Method that query all target translation
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} uuid The item identification
 * @returns An SQL INSERT string with target translation
 * @since 1.0.0
 */
const translationQuery = async (target, uuid) => {
  let data = await getJsonFile(target, true);

  let res = [];
  for (const item of data) {
    if (item[`${getSingular(target)}_uuid`] === uuid) {
      let { fields, values } = query(target, item);

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

/**
 * Method that 'query' a field from main query
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} field The field name representing the 'sub query'
 * @param {string[]} array All values from field of main query
 * @returns An SQL INSERT string
 * @since 1.0.0
 */
const subQuery = (target, field, array) => {
  let res = "";

  for (const item of array) {
    // Ignore any possible array or non dictionary/map
    if (typeof item !== "object" || Array.isArray(item)) return "";

    let { fields, values } = query(target, item);

    res +=
      `INSERT INTO ${target}_${field} (` +
      fields +
      ") VALUES (" +
      values +
      ");\n";
  }

  return res;
};

/**
 * Method that query and create a SQL INSERT string
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string[]} array All values from file/field
 * @returns All fields, values and subQueries from file/field
 * @since 1.0.0
 */
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

/**
 * Method that converts all items inside the array into a PostgreSQL array
 * @param {string[]} array All values from field
 * @returns An string representing the PostgreSQL array
 * @since 1.0.0
 */
const objectToPostgreSQLArray = (array) => {
  let res = "{";

  for (let i = 0; i < array.length; i++) {
    const value = array[i];

    if (typeof value === "string") {
      res += `"${value}", `;
      continue;
    }

    res += `${value}, `;
  }

  return res.slice(0, -2) + "}";
};

/**
 * Method that read and parse the json file using default path
 * @param {string} target The target (actors, episodes...) of the request
 * @param {boolean} isTranslation Define target is from a normal or translation file
 * @returns An JSON with all file items
 * @since 1.0.0
 */
const getJsonFile = async (target, isTranslation) => {
  const res = await fs.readFile(
    isTranslation
      ? `${BASE_PATH}/translations/${target}_translations.json`
      : `${BASE_PATH}/${target}.json`
  );

  return JSON.parse(res);
};

/**
 * Method that escape/fix single quotes from string (according to SQL)
 * @param {string} value The string to be fixed
 * @returns An quote fixed string
 */
const escapeSingleQuote = (value) => {
  return value.replace(/'/g, "''");
};

main();
