#!/usr/bin/node

import { error, log } from "console";
import fs from "fs";

import { deleteBy, insert, updateBy } from "./utils/repository.js";
import requests from "../requests/requests.json" assert { type: "json" };
import {
  DB_FOLDER,
  TABLES,
  TRANSLATION_TABLES,
  URL,
  VERSION,
} from "./utils/constants.js";

let output = {};
let outputFile = "./requests/output.json";

/**
 * Main script
 */
async function main() {
  let isTest = false;

  if (process.argv[3] === "--test") {
    isTest = true;
    outputFile = "./test/output.json";
    await setup(isTest);
  }

  // Test API connection
  await ping();

  // Loop over all methods
  for (const method in requests) {
    // Loop over all targets
    for (const target in requests[method]) {
      // Create new target
      output[method] = { ...output[method], [target]: [] };

      // Loop over all items
      for (const item in requests[method][target]) {
        const value = requests[method][target][item];

        let res;
        switch (method) {
          case "POST":
            res = await insert(target, value);
            break;
          case "UPDATE":
            res = await updateBy(value.uuid, target, value);
            break;
          case "DELETE":
            res = await deleteBy(value, target);
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

  fs.writeFile("./requests/requests.json", "", (error) => {
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
 * Clear database (or test) folder.
 *
 * The folder to clear is defined with 'DB_FOLDER' on '.env' file.
 */
const clear = async () => {
  try {
    await fs.promises.rm(`./${DB_FOLDER}/`, { recursive: true });
  } catch (err) {
    log(`Folder './${DB_FOLDER}/' not found. Skipping..`);
  }
};

/**
 * Script setup
 *
 * * Running for the **first time** will create all 'database' files.
 * * Running with **'--test'** will **DELETE** any './test/' folder and recreate all files.
 */
const setup = async (isTest) => {
  if (isTest) {
    await clear();
  }

  if (!fs.existsSync(`./${DB_FOLDER}/`)) {
    try {
      await fs.promises.mkdir(`./${DB_FOLDER}/${VERSION}/data/translations`, {
        recursive: true,
      });

      for (const table in TABLES) {
        const name = TABLES[table];
        await fs.promises.writeFile(
          `./${DB_FOLDER}/${VERSION}/data/${name}.json`,
          "[]",
          {
            recursive: true,
            flag: "w+",
          }
        );
      }

      for (const table in TRANSLATION_TABLES) {
        const name = TRANSLATION_TABLES[table];
        await fs.promises.writeFile(
          `./${DB_FOLDER}/${VERSION}/data/translations/${name}_translations.json`,
          "[]",
          {
            recursive: true,
            flag: "w+",
          }
        );
      }
    } catch (err) {
      error(err);
      process.exit(1);
    }
  }
};

main();
