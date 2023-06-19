# HawAPI - API-Data

Static data from the [HawAPI](https://github.com/HawAPI/HawAPI) project.

## Topics

- [Prerequisites](#prerequisites)
- [Dependencies](#dependencies)
- [Requesting](#requesting)
- [Running](#running)
- [Contact](#contact)
- [License](#license)

## Prerequisites

- Text editor or IDE (VsCode, Subline, Noteped++)
- Node
  - Npm or Yarn

## Dependencies

- [dotenv](https://www.npmjs.com/package/dotenv)

## Setup

Step by step of how to run the application.

> See all [Prerequisites](#prerequisites)

### Clone

> **Note** \
> Alternatively, you could [download all files (Zip)](https://github.com/HawAPI/website/archive/refs/heads/main.zip)

- SSH

```
git clone git@github.com:HawAPI/website.git
```

- HTTPS

```
git clone https://github.com/HawAPI/website.git
```

### Requesting

All requests will be placed inside the [requests.json](./requests/requests.json)

> METHOD > TARGET > LIST OF ITEMS

<details>
<summary>Example</summary>

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

</details>

#### Output

All request will generate a [output.json](./requests/output.json) file with an **status code** and **message**.

<details>
<summary>Example</summary>

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

</details>

#### Methods

Any method other than `POST`, `UPDATE` and `DELETE` will be ignored

<details>
<summary>Example</summary>

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

</details>

### Running

> Check [Requesting](#requesting)

Before running the script, create and define all required variables inside the `.env`. Use [.env.example](.env.example) as reference.

If you are running using local HawAPI application create and define all required variables inside the `.env.test` and use the `dev/test` command. Use [.env.test.example](.env.test.example) as reference.

#### Dev/Test

Using **dev/test** command all outputs will be stored on a `/test/` folder.

```
make dev
// or
make test
```

#### Production

Using **start** command all outputs will be stored on a `/database/` folder.

```
make start
```

## Contact

For any questions about the project: [Contact](https://github.com/HawAPI/HawAPI#contact).

## License

HawAPI is licensed under the [MIT License](https://github.com/HawAPI/website/blob/main/LICENSE).

> Check out all [licenses/dependencies](https://hawapi.theproject.id/docs/about/#licenses)
