# HawAPI - API-Data

Static data from the [HawAPI](https://github.com/HawAPI/HawAPI) project.

## Topics

- [Prerequisites](#prerequisites)
- [Dependencies](#dependencies)
- [Contributing](./docs/CONTRIBUTING.md)
- [Requesting](./docs/REQUESTTING.md)
- [Running](#running)
- [Contact](#contact)
- [License](#license)

## Prerequisites

- The **HawAPI** project running (and all its [prerequisites](https://github.com/HawAPI/HawAPI/blob/main/docs/GETTING_STARTED.md#prerequisites))
- Node
  - Npm or Yarn for **run the script**

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

### Running

> Check [Requesting](./docs/REQUESTTING.md)

Before running the script:

-
- Create and define all required variables inside the `.env`. Use [.env.example](.env.example) as reference.

If you are running using local HawAPI application create and define all required variables inside the `.env.dev` and use the `dev` command. Use [.env.dev.example](.env.dev.example) as reference.

#### Dev/Test

Using **dev** command all outputs will be stored on a `/dev/` folder.

```
yarn dev
```

#### Production

Using **start** command all outputs will be stored on a `/database/` folder.

```
yarn start
```

## Contact

For any questions about the project: [Contact](https://github.com/HawAPI/HawAPI#contact).

## License

HawAPI is licensed under the [MIT License](https://github.com/HawAPI/website/blob/main/LICENSE).

> Check out all [licenses/dependencies](https://hawapi.theproject.id/docs/about/#licenses)
