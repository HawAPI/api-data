import fs from "fs/promises";
import { error } from "console";
import {
  TRANSLATION_FIELDS,
  TRANSLATION_TABLES,
  DB_FOLDER,
  VERSION,
} from "./constants.js";

/**
 * Method that add a new item (to local repository)
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @since 1.0.0
 */
export const insertLocal = async (target, body) => {
  const path = `./${DB_FOLDER}/${VERSION}/data/${target}.json`;
  try {
    let data = await fs.readFile(path, "utf8");
    data = JSON.parse(data);

    if (TRANSLATION_TABLES.includes(target)) {
      body = await insertLocalTranslation(target, body);
    }

    data.push(body);
    await writeToFile(path, data);
  } catch (err) {
    error(err);
  }
};

/**
 * Method that add a new translation item (to local repository)
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @returns An modified body without translations fields
 */
const insertLocalTranslation = async (target, body) => {
  const path = `./${DB_FOLDER}/${VERSION}/data/translations/${target}_translations.json`;
  let translationData = {};

  for (const field in body) {
    // Save and remove translation fields
    if (TRANSLATION_FIELDS.includes(field)) {
      translationData[field] = body[field];

      delete body[field];
    }

    translationData[`${target.slice(0, -1)}_uuid`] = body["uuid"];
  }

  let translation = await fs.readFile(path, "utf8");
  translation = JSON.parse(translation);
  translation.push(translationData);

  await writeToFile(path, translation);

  // Body without translations fields
  return body;
};

/**
 * Method that update a item (from local repository)
 * @param {string} uuid The identification of the item
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @since 1.0.0
 */
export const updateLocal = async (uuid, target, patch) => {
  const path = `./${DB_FOLDER}/${VERSION}/data/${target}.json`;
  try {
    let data = await fs.readFile(path, "utf8");
    data = JSON.parse(data);

    for (const item in data) {
      if (data[item].uuid === uuid) {
        for (const key in patch) {
          data[item][key] = patch[key];
        }
      }
    }

    await writeToFile(path, data);
  } catch (err) {
    error(err);
  }
};

/**
 * Method that delete a item <strong>(from local repository)</strong>
 * @param {string} uuid The identification of the item
 * @param {string} target The target (actors, episodes...) of the request
 * @since 1.0.0
 */
export const deleteLocal = async (uuid, target) => {
  const path = `./${DB_FOLDER}/${VERSION}/data/${target}.json`;
  try {
    let data = await fs.readFile(path, "utf8");
    data = JSON.parse(data);
    data = data.filter((e) => e.uuid !== uuid);

    await writeToFile(path, data);
  } catch (err) {
    error(err);
  }
};

/**
 * Method that write the data to specific file
 * @param {string} path The file path
 * @param {string} data The file data
 * @since 1.0.0
 */
const writeToFile = async (path, data) => {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
};
