/**
 * Database folder variable defined on '.env' file
 */
export const DB_FOLDER = process.env.DB_FOLDER;

/**
 * API version variable defined on '.env' file
 */
export const VERSION = process.env.VERSION;

/**
 * API url variable defined on '.env' file
 */
export const URL = process.env.API_URL;

/**
 * API access token variable defined on '.env' file
 */
export const TOKEN = process.env.TOKEN;

/**
 * List of tables that require translations.
 *
 * All translations will be saved on 'data/translations/\<target\>_translations.json'
 */
export const TRANSLATION_TABLES = ["episodes", "games", "locations", "seasons"];

/**
 * List of fields that has translation on {@link TRANSLATION_TABLES}.
 */
export const TRANSLATION_FIELDS = [
  "language",
  "title",
  "name",
  "description",
  "trailer",
  "genres",
  "trailers",
];

/**
 * List of tables from HawAPI.
 */
export const TABLES = [
  "actors",
  "characters",
  "episodes",
  "games",
  "locations",
  "seasons",
  "soundtracks",
];
