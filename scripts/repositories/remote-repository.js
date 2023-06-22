import { error } from "console";

import { VERSION, URL, TOKEN, TRANSLATION_TABLES } from "../constants.js";
import {
  deleteLocal,
  deleteLocalTranslation,
  insertLocal,
  insertLocalTranslation,
  updateLocal,
  updateLocalTranslation,
} from "./local-repository.js";
import { getSingular } from "../utils.js";

// Default options
const options = {
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
};

/**
 * Method that add a new item
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @returns An 'status_code' and 'message'
 * @since 1.0.0
 * @see {@link insertLocal}
 */
export const insert = async (target, body) => {
  options["method"] = "POST";
  options["body"] = JSON.stringify(body);

  const result = await fetch(URL + `/${VERSION}/${target}`, options);

  if (result.ok) {
    const resBody = await result.json();
    await insertLocal(target, resBody);
  }

  return {
    status_code: result.status,
    message: await getMessageOr(
      result,
      `Something wrong happen. Item: '${uuid}`
    ),
  };
};

/**
 * Method that add a new translation item
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @returns An 'status_code' and 'message'
 * @since 1.0.0
 * @see {@link insertLocalTranslation}
 */
export const insertTranslation = async (target, body) => {
  const message = validateTranslation(target, body);
  if (message) return message;

  options["method"] = "POST";
  options["body"] = JSON.stringify(body);

  const uuid = body[`${getSingular(target)}_uuid`];
  const result = await fetch(
    URL + `/${VERSION}/${target}/${uuid}/translations`,
    options
  );

  if (result.ok) {
    const resBody = await result.json();
    resBody[`${getSingular(target)}_uuid`] = uuid;
    await insertLocalTranslation(target, resBody);
  }

  return {
    status_code: result.status,
    message: await getMessageOr(
      result,
      `Something wrong happen. Item: '${uuid}`
    ),
  };
};

/**
 * Method that update a item
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @returns An 'status_code' and 'message'
 * @since 1.0.0
 * @see {@link updateLocal}
 */
export const updateBy = async (target, patch) => {
  options["method"] = "PATCH";
  options["body"] = JSON.stringify(patch);

  const result = await fetch(
    URL + `/${VERSION}/${target}/${patch.uuid}`,
    options
  );

  if (result.ok) {
    await updateLocal(target, patch);
  }

  return {
    status_code: result.status,
    message: await getMessageOr(
      result,
      `Something wrong happen. Item: '${patch.uuid}`
    ),
  };
};

/**
 * Method that update a translation item
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @returns An 'status_code' and 'message'
 * @since 1.0.0
 * @see {@link updateLocalTranslation}
 */
export const updateTranslation = async (target, patch) => {
  const message = validateTranslation(target, patch);
  if (message) return message;

  options["method"] = "PATCH";
  options["body"] = JSON.stringify(patch);

  const uuid = patch[`${getSingular(target)}_uuid`];
  const result = await fetch(
    URL + `/${VERSION}/${target}/${uuid}/translations/${patch.language}`,
    options
  );

  if (result.ok) {
    await updateLocalTranslation(target, patch);
  }

  return {
    status_code: result.status,
    message: await getMessageOr(
      result,
      `Something wrong happen. Item: '${uuid}`
    ),
  };
};

/**
 * Method that delete a item
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @returns An 'status_code' and 'message'
 * @since 1.0.0
 * @see {@link deleteLocal}
 */
export const deleteBy = async (target, body) => {
  options["method"] = "DELETE";

  const result = await fetch(
    URL + `/${VERSION}/${target}/${body.uuid}`,
    options
  );

  let message = `Deleted item: '${body.uuid}'`;
  if (result.ok) {
    await deleteLocal(body, target);
  } else {
    message = await getMessageOr(
      result,
      `Something wrong happen. Item: '${uuid}`
    );
  }

  return {
    status_code: result.status,
    message,
  };
};

/**
 * Method that delete a translation item
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @returns An 'status_code' and 'message'
 * @since 1.0.0
 * @see {@link deleteLocalTranslation}
 */
export const deleteTranslation = async (target, body) => {
  let message = validateTranslation(target, body);
  if (message) return message;

  options["method"] = "DELETE";

  const uuid = body[`${getSingular(target)}_uuid`];
  const result = await fetch(
    URL + `/${VERSION}/${target}/${uuid}/translations/${body.language}`,
    options
  );

  message = `Deleted item: '${uuid}'`;
  if (result.ok) {
    await deleteLocalTranslation(target, body);
  } else {
    message = await getMessageOr(
      result,
      `Something wrong happen. Item: '${uuid} and Language '${body.language}'`
    );
  }

  return {
    status_code: result.status,
    message,
  };
};

/**
 * Method to get response body
 * @param {Response} response
 * @returns Response body or the fallback message
 * @since 1.0.0
 */
const getMessageOr = async (response, fallback) => {
  let message = "";
  try {
    message = await response.json();
  } catch (err) {
    error(err);
    message = fallback;
  }
  return message;
};

/**
 * Method to validate if request is for static or translation table
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} patch The body (model) of the request
 * @returns An error message if NOT VALID or undefined if VALID
 * @since 1.0.0
 */
const validateTranslation = (target, patch) => {
  if (!TRANSLATION_TABLES.includes(target)) {
    return {
      status_code: 0,
      message: `Table '${target}' doesn't have a translation table`,
    };
  }

  if (!("language" in patch)) {
    return {
      status_code: 0,
      message: "Field 'language' not defined!",
    };
  }
};
