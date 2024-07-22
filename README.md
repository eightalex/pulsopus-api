# Pulsopus API

## Environment vars
This project uses the following environment variables:

| Name                      | Description                | Default Value |
|---------------------------|----------------------------|---------------|
| JWT_SECRET_ACCESS         | accepted values            | *             |
| JWT_SECRET_REFRESH        | Cors accepted values       | *             |
| JWT_SECRET_ACCESS_EXPIRE  | Cors accepted values       | *             |
| JWT_SECRET_REFRESH_EXPIRE | Cors accepted values       | *             |
| MONGODB_URI               | Cors accepted values       | *             |
| MAIL_HOST                 | Cors accepted values       | *             |
| MAIL_PORT                 | Cors accepted values       | *             |
| MAIL_USER                 | Cors accepted values       | *             |
| MAIL_PASSWORD             | Cors accepted values       | *             |

## Pre-requisites
- Install [Node.js](https://nodejs.org/en/) version 20.12.2

## Project Structure
The folder structure of this app is explained below:

| Name          | Description                                                                                      |
|---------------|--------------------------------------------------------------------------------------------------|
| **node_modules** | Contains all dependencies                                                                        |
| **dist**      | Contains the distributable (or output) from your TypeScript build.                               |
| **apps**      | Contains  source code that will be compiled to the dist dir                                      |
| **libs**      | Common libraries to be used across your app.                                                     
| package.json  | Contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped) |
| nest-cli.json | Config settings for NestJS                                                                       |
| eslintrc.js   | Config settings for ESLint code style checking                                                   |

### Installation
```sh
$ yarn install
```

### Running the app
#### dev
```sh
$ yarn dev
```

#### prod
```sh
# build
$ yarn run build
# start
$ yarn run start:prod
```

### see more script [here](./package.json)