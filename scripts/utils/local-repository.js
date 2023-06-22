import fs from "fs/promises";
import { error, log, warn } from "console";

import {
  TRANSLATION_FIELDS,
  TRANSLATION_TABLES,
  DB_FOLDER,
  VERSION,
} from "./constants.js";
import { getSingular } from "./utils.js";

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
      const translationFields = getTranslationFields(target, body);

      await insertLocalTranslation(target, translationFields);

      // Remove translation fields from main model
      for (const field in translationFields) {
        delete body[field];
      }
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
 */
export const insertLocalTranslation = async (target, body) => {
  const path = `./${DB_FOLDER}/${VERSION}/data/translations/${target}_translations.json`;
  try {
    let data = await fs.readFile(path, "utf8");
    data = JSON.parse(data);

    data.push(body);

    await writeToFile(path, data);
  } catch (err) {
    error(err);
  }
};

/**
 * Method that update a item (from local repository)
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @since 1.0.0
 */
export const updateLocal = async (target, patch) => {
  const path = `./${DB_FOLDER}/${VERSION}/data/${target}.json`;
  try {
    let data = await fs.readFile(path, "utf8");
    data = JSON.parse(data);

    // Loop over all items inside file
    for (const item in data) {
      // Validate item
      if (data[item].uuid === patch.uuid) {
        // Only update fields declared inside 'patch'
        for (const field in patch) {
          if (TRANSLATION_FIELDS.includes(field)) {
            warn(
              `(UPDATE): Item '${patch.uuid}' contains translation fields that will be ignored.\n` +
                `(UPDATE): To update translation fields use '${getSingular(
                  target
                )}_uuid' and 'language' fields inside the request method`
            );
            continue;
          }

          data[item][field] = patch[field];
        }
      }
    }

    await writeToFile(path, data);
  } catch (err) {
    error(err);
  }
};

export const updateLocalTranslation = async (target, patch) => {
  const path = `./${DB_FOLDER}/${VERSION}/data/translations/${target}_translations.json`;
  try {
    let data = await fs.readFile(path, "utf8");
    data = JSON.parse(data);

    const uuidField = getSingular(target) + "_uuid";
    const uuid = patch[uuidField];
    for (const item in data) {
      if (
        data[item][uuidField] === uuid &&
        data[item].language === patch.language
      ) {
        data[item][uuidField] = uuid;

        for (const field in patch) {
          if (!TRANSLATION_FIELDS.includes(field) && field !== uuidField) {
            warn(
              `(UPDATE): Item '${uuid}' with language '${patch.language}' contains fields that will be ignored.\n` +
                `(UPDATE): To update static fields use 'uuid' instead of '${getSingular(
                  target
                )}_uuid' inside the request method`
            );
            continue;
          }

          data[item][field] = patch[field];
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
export const deleteLocal = async (body, target) => {
  const path = `./${DB_FOLDER}/${VERSION}/data/${target}.json`;
  try {
    let data = await fs.readFile(path, "utf8");
    data = JSON.parse(data);

    data = data.filter((e) => e.uuid !== body.uuid);

    if (TRANSLATION_TABLES.includes(target)) {
      await deleteLocalTranslation(target, body);
    }

    await writeToFile(path, data);
  } catch (err) {
    error(err);
  }
};

export const deleteLocalTranslation = async (target, body) => {
  const path = `./${DB_FOLDER}/${VERSION}/data/translations/${target}_translations.json`;
  try {
    let data = await fs.readFile(path, "utf8");
    data = JSON.parse(data);

    const uuid = body[getSingular(target) + "_uuid"];
    data = data.filter((e) => e.uuid !== uuid && e.language !== body.language);

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

const getTranslationFields = (target, body) => {
  let fields = {};
  for (const field in body) {
    if (TRANSLATION_FIELDS.includes(field)) {
      fields[field] = body[field];
    }
  }
  log(target);
  fields[`${getSingular(target)}_uuid`] = body["uuid"];
  return fields;
};
