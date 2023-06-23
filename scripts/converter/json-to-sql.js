import fs from "fs/promises";

import { DB_FOLDER, TRANSLATION_TABLES, VERSION } from "../constants.js";
import { getSingular } from "../utils.js";
import { log } from "console";

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

  for (const index in files) {
    if (!(await fs.stat(`${path}/${files[index]}`)).isDirectory()) {
      await jsonToSQL(files[index]);
    }
  }

  log(
    `Converted '${path}' files into SQL (Output: '${OUTPUT_PATH}/hawapi.sql')`
  );
}

const jsonToSQL = async (target) => {
  // Remove file extension
  target = target.substring(0, target.lastIndexOf("."));

  let data = await fs.readFile(`./${DB_FOLDER}/${VERSION}/data/${target}.json`);
  data = JSON.parse(data);

  let queries = [];
  for (const item in data) {
    const uuid = data[item]["uuid"];

    let subQueries = [];
    let query = `INSERT INTO ${target} (`;

    let fields = "";
    let values = "";
    for (const field in data[item]) {
      let value = data[item][field];

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

    if (TRANSLATION_TABLES.includes(target)) {
      let data = await fs.readFile(
        `./${DB_FOLDER}/${VERSION}/data/translations/${target}_translations.json`
      );
      data = JSON.parse(data);

      for (const item in data) {
        if (data[item][`${getSingular(target)}_uuid`] === uuid) {
          let query1 = `INSERT INTO ${target}_translations (`;

          let fields1 = "";
          let values1 = "";
          for (const field in data[item]) {
            let value = data[item][field];

            switch (typeof value) {
              case "string":
                values1 += `'${escapeSingleQuote(value)}', `;
                break;
              case "number":
              case "boolean":
                values1 += `${value}, `;
                break;
              case "object":
                values1 += `${objectToPostgreSQLArray(value)}, `;
                continue;
            }

            if (SPECIAL_NAMES.includes(field)) {
              fields1 += `"${field}", `;
              continue;
            }

            fields1 += `${field}, `;
          }

          fields1 = fields1.slice(0, -2);
          values1 = values1.slice(0, -2);

          query1 += fields1 + ") VALUES (" + values1 + ");\n";
          subQueries.push(query1);
        }
      }
    }

    query += fields + ") VALUES (" + values + ");\n";
    queries.push(query, ...subQueries);
  }

  await fs.writeFile(`${OUTPUT_PATH}/hawapi.sql`, queries, { flag: "a" });
};

const subQuery = (target, fieldName, array) => {
  let res = "";
  for (const item in array) {
    let query = `INSERT INTO ${target}_${fieldName} (`;
    if (!(typeof array[item] === "object") || Array.isArray(item)) {
      return "";
    }

    let fields = "";
    let values = "";
    for (const field in array[item]) {
      let value = array[item][field];

      switch (typeof value) {
        case "string":
          values += `'${escapeSingleQuote(value)}', `;
          break;
        case "number":
        case "boolean":
          values += `${value}, `;
          break;
        case "object":
          if (!Array.isArray(value)) {
            values += `${objectToPostgreSQLArray(value)}, `;
          }
          continue;
      }

      if (SPECIAL_NAMES.includes(field)) {
        fields += `"${field}", `;
        continue;
      }

      fields += `${field}, `;
    }

    fields = fields.slice(0, -2);
    values = values.slice(0, -2);

    query += fields + ") VALUES (" + values + ");\n";
    res += query;
  }

  return res;
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

const fieldsAndValues = () => {
  let fields = "";
  let values = "";
  for (const field in array[item]) {
    let value = array[item][field];

    switch (typeof value) {
      case "string":
        values += `'${escapeSingleQuote(value)}', `;
        break;
      case "number":
      case "boolean":
        values += `${value}, `;
        break;
      case "object":
        if (!Array.isArray(value)) {
          values += `${objectToPostgreSQLArray(value)}, `;
        }
        continue;
    }

    if (SPECIAL_NAMES.includes(field)) {
      fields += `"${field}", `;
      continue;
    }

    fields += `${field}, `;
  }
};

main();
