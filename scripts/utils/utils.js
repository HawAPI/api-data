/**
 * Method to get singular name of table
 * @param {string} value The table name
 * @returns Singular version of table name
 */
export const getSingular = (value) => {
  return value.slice(0, -1);
};
