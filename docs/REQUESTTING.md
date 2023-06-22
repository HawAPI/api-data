### Requesting

All requests will be placed inside the [requests.json](./requests/requests.json)

### Topics

- [Support](#support)
- [Request](#request)
- [Output](#output)
- [Methods](#methods)

### Support

| Target                   |      Method(s)       |
| :----------------------- | :------------------: |
| actors                   | POST, UPDATE, DELETE |
| actors/translations      | POST, UPDATE, DELETE |
| characters               | POST, UPDATE, DELETE |
| characters/translations  | POST, UPDATE, DELETE |
| episodes                 | POST, UPDATE, DELETE |
| episodes/translations    | POST, UPDATE, DELETE |
| games                    | POST, UPDATE, DELETE |
| games/translations       | POST, UPDATE, DELETE |
| locations                | POST, UPDATE, DELETE |
| locations/translations   | POST, UPDATE, DELETE |
| seasons                  | POST, UPDATE, DELETE |
| seasons/translations     | POST, UPDATE, DELETE |
| soundtracks              | POST, UPDATE, DELETE |
| soundtracks/translations | POST, UPDATE, DELETE |

### Request

> METHOD > TARGET > LIST OF ITEMS

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
    "actors": ["a07cfae9-4c2e-4bf3-8291-ff86621f72f7"]
  }
}
```

#### Output

All request will generate a [output.json](./requests/output.json) file with an **status code** and **message**.

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

#### Methods

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
