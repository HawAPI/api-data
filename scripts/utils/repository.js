import { VERSION, URL, TOKEN } from "./constants.js";
import { deleteLocal, insertLocal, updateLocal } from "./local-repository.js";

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

  const result = await fetch(URL + `/${VERSION}` + `/${target}`, options);
  const res = {
    status_code: result.status,
    message: await result.json(),
  };

  if (result.ok) {
    await insertLocal(target, res.message);
  }

  return res;
};

/**
 * Method that update a item
 * @param {string} uuid The identification of the item
 * @param {string} target The target (actors, episodes...) of the request
 * @param {string} body The body (model) of the request
 * @returns An 'status_code' and 'message'
 * @since 1.0.0
 * @see {@link updateLocal}
 */
export const updateBy = async (uuid, target, patch) => {
  options["method"] = "PATCH";
  options["body"] = JSON.stringify(patch);

  const result = await fetch(
    URL + `/${VERSION}` + `/${target}/${uuid}`,
    options
  );

  if (result.ok) {
    await updateLocal(uuid, target, patch);
  }

  return {
    status_code: result.status,
    message: await result.json(),
  };
};

/**
 * Method that delete a item
 * @param {string} uuid The identification of the item
 * @param {string} target The target (actors, episodes...) of the request
 * @returns An 'status_code' and 'message'
 * @since 1.0.0
 * @see {@link deleteLocal}
 */
export const deleteBy = async (uuid, target) => {
  options["method"] = "DELETE";

  const result = await fetch(
    URL + `/${VERSION}` + `/${target}/${uuid}`,
    options
  );
  let message = `Deleted item: '${uuid}'`;

  if (result.ok) {
    await deleteLocal(uuid, target);
  } else {
    message = `Something wrong happen. Item: '${uuid}'`;
  }

  return {
    status_code: result.status,
    message: `Deleted item: '${uuid}'`,
  };
};
