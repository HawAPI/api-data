#!/usr/bin/node

import { error, log } from "console";
import fs from "fs";

import {
  deleteBy,
  deleteTranslation,
  insert,
  insertTranslation,
  updateBy,
  updateTranslation,
} from "./repositories/remote-repository.js";
import {
  DB_FOLDER,
  TABLES,
  TRANSLATION_TABLES,
  URL,
  VERSION,
} from "./constants.js";
import { getSingular } from "./utils.js";

let output = {};
let outputFile = "./requests/output.json";
let requestsFile = "./requests/requests.json";

/**
 * Main script
 */
async function main() {
  // Test API connection
  await ping();

  // Script setup
  await setup();

  if (process.argv.includes("--dev")) {
    outputFile = `./${DB_FOLDER}/output.json`;
    requestsFile = `./${DB_FOLDER}/requests.json`;
  }

  // Loop over all methods
  const requests = await getRequests();
  for (const method in requests) {
    // Loop over all targets
    for (const target in requests[method]) {
      // Create new target
      output[method] = { ...output[method], [target]: [] };

      // Loop over all items
      for (const item in requests[method][target]) {
        const value = requests[method][target][item];

        let res;
        let isTranslation = `${getSingular(target)}_uuid` in value;
        switch (true) {
          case isTranslation && method === "POST":
            res = await insertTranslation(target, value);
            break;
          case method === "POST":
            res = await insert(target, value);
            break;
          case isTranslation && method === "UPDATE":
            res = await updateTranslation(target, value);
            break;
          case method === "UPDATE":
            res = await updateBy(target, value);
            break;
          case isTranslation && method === "DELETE":
            res = await deleteTranslation(target, value);
            break;
          case method === "DELETE":
            res = await deleteBy(target, value);
            break;
          default:
            console.warn(`Method '${method}' is not valid. Skipping`);
            res = {
              status_code: 0,
              message: `Method '${method}' is not valid`,
            };
        }

        output[method][target].push(res);
      }
    }
  }

  fs.writeFile(outputFile, JSON.stringify(output, null, 2), (error) => {
    if (error) throw error;
  });

  fs.writeFile(requestsFile, "{}", (error) => {
    if (error) throw error;
  });
}

/**
 * Test API connection
 */
async function ping() {
  await fetch(URL + "/ping")
    .then(async (res) => {
      log(`[${res.status}] ${await res.text()}`);
    })
    .catch((err) => {
      error(err);
      process.exit(1);
    });
}

/**
 * Method to read requests file
 * @returns All content inside the requests file
 */
const getRequests = async () => {
  const res = await fs.promises.readFile(requestsFile, { encoding: "utf8" });
  return JSON.parse(res);
};

/**
 * Script setup
 *
 * * Running for the **first time** will create all 'database' files.
 */
const setup = async () => {
  if (!fs.existsSync(`./${DB_FOLDER}/`)) {
    try {
      await fs.promises.mkdir(`./${DB_FOLDER}/${VERSION}/data/translations`, {
        recursive: true,
      });

      const options = {
        recursive: true,
        flag: "w+",
      };

      for (const table in TABLES) {
        await fs.promises.writeFile(
          `./${DB_FOLDER}/${VERSION}/data/${TABLES[table]}.json`,
          "[]",
          options
        );
      }

      for (const table in TRANSLATION_TABLES) {
        await fs.promises.writeFile(
          `./${DB_FOLDER}/${VERSION}/data/translations/${TRANSLATION_TABLES[table]}_translations.json`,
          "[]",
          options
        );
      }
    } catch (err) {
      error(err);
      process.exit(1);
    }
  }
};

main();
