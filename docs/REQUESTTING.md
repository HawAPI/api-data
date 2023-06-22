### Requesting

Following the idea of `Open Source` API, all **HawAPI** data will be available on this repository (JSON format).

- The data can **ONLY** be **ADDED**, **UPDATED** or **DELETED** using this [script](../scripts/start.js)
- All **POST**, **UPDATE** or **DELETE** will use the respective target endpoint and can **ONLY** be accessed using the _Bearer_ authentication `Token (JWT)`

### Topics

- [Support](#support)
- [Request](#request)
  - [Static data](#static-data)
  - [Translation data](#translation-data)
- [Output](#output)
- [Methods](#methods)

### Support

| Target                 | POST | UPDATE | DELETE |      Auth      |
| :--------------------- | :--: | :----: | :----: | :------------: |
| actors                 | Yes  |  Yes   |  Yes   | `Required/JWT` |
| actors/socials         |  No  |   No   |   No   | `Required/JWT` |
| characters             | Yes  |  Yes   |  Yes   | `Required/JWT` |
| episodes               | Yes  |  Yes   |  Yes   | `Required/JWT` |
| episodes/translations  | Yes  |  Yes   |  Yes   | `Required/JWT` |
| games                  | Yes  |  Yes   |  Yes   | `Required/JWT` |
| games/translations     | Yes  |  Yes   |  Yes   | `Required/JWT` |
| locations              | Yes  |  Yes   |  Yes   | `Required/JWT` |
| locations/translations | Yes  |  Yes   |  Yes   | `Required/JWT` |
| seasons                | Yes  |  Yes   |  Yes   | `Required/JWT` |
| seasons/translations   | Yes  |  Yes   |  Yes   | `Required/JWT` |
| soundtracks            | Yes  |  Yes   |  Yes   | `Required/JWT` |

### Request

> **Note**
> All requests will be placed inside the [requests/requests.json](./requests/requests.json) or [dev/requests.json](./dev/requests.json) (If running locally)

- METHOD -> TARGET -> LIST OF ITEMS

#### Static data

```json
{
  "POST": {
    "actors": [
      {
        "first_name": "Lorem",
        "last_name": "Ipsum",
        "nicknames": ["lor", "em"]
        // ...
      }
    ]
  },
  "UPDATE": {
    "actors": [
      {
        "uuid": "a07cfae9-4c2e-4bf3-8291-ff86621f72f7",
        "gender": 1
        // ...
      }
    ]
  },
  "DELETE": {
    "actors": [
      {
        "a07cfae9-4c2e-4bf3-8291-ff86621f72f7"
      }
    ]
  }
}
```

- 1º - Will **ADD** a new actor item
- 2º - Will **UPDATE** an actor item USING the **UUID** as reference
- 3º - Will **DELETE** an actor (and all translations if any) item USING the **UUID** as reference

#### Translation data

> **Note**
> The script will validate translation data using the '\<target\>\_uuid' and/or 'language' fields

```json
{
  "POST": {
    "episodes": [
      {
        "language": "en-US",
        "title": "Lorem",
        "description": "Ipsum"
        // ...
      }
    ]
  },
  "UPDATE": {
    "episodes": [
      {
        "episode_uuid": "a07cfae9-4c2e-4bf3-8291-ff86621f72f7",
        "language": "en-US",
        "title": "Lorem Ipsum"
        // ...
      }
    ]
  },
  "DELETE": {
    "episodes": [
      {
        "episode_uuid": "a07cfae9-4c2e-4bf3-8291-ff86621f72f7",
        "language": "en-US"
      }
    ]
  }
}
```

- 1º - Will **ADD** a new episode translation
- 2º - Will **UPDATE** an episode translation USING the **UUID** and **LANGUAGE** as reference
- 3º - Will **DELETE** an episode translation USING the **UUID** and **LANGUAGE** as reference

### Output

All request will generate a [requests/output.json](./requests/output.json) or [dev/output.json](./dev/output.json) (If running locally) with an **status code** and **message**.

```json
{
  "POST": {
    "actors": [
      {
        "status_code": 201,
        "message": {
          "first_name": "Lorem",
          "last_name": "Ipsum",
          "nicknames": ["lor", "em"]
          // ...
        }
      }
    ]
  },
  "UPDATE": {
    "actors": [
      {
        "status_code": 200,
        "message": {
          "uuid": "a07cfae9-4c2e-4bf3-8291-ff86621f72f7",
          "gender": 1
          // ...
        }
      }
    ]
  },
  "DELETE": {
    "actors": [
      {
        "status_code": 204,
        "message": "Deleted item: 'a07cfae9-4c2e-4bf3-8291-ff86621f72f7'"
      }
    ]
  }
}
```

### Methods

Any method other than `POST`, `UPDATE` and `DELETE` will be ignored

```json
{
  "WRONG": {
    "actors": [
      {
        "status_code": 0,
        "message": "Method 'WRONG' is not valid"
      }
    ]
  }
}
```

> Check [Running](../README.md#running)
