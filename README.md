# Pulsopus API

## Environment vars
This project uses the following environment variables:

| Name                      | Description                              | Default Value |
|---------------------------|------------------------------------------|---------------|
| JWT_SECRET_ACCESS         | jwt access secret value                  | *             |
| JWT_SECRET_REFRESH        | jwt refresh secret value                 | *             |
| JWT_SECRET_ACCESS_EXPIRE  | jwt access secret expiration time value  | *             |
| JWT_SECRET_REFRESH_EXPIRE | jwt refresh secret expiration time value | *             |
| MONGODB_URI               | mongo url connection string              | *             |
| MAIL_HOST                 | mailer host                              | *             |
| MAIL_PORT                 | mailer port                              | *             |
| MAIL_USER                 | mailer username                          | *             |
| MAIL_PASSWORD             | mailer password                          | *             |

## Pre-requisites
- Install [Node.js](https://nodejs.org/en/) version 20.12.2

## Project Structure
The folder structure of this app is explained below:

| Name             | Description                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------|
| **node_modules** | Contains all dependencies                                                                       |
| **dist**         | Contains the distributable (or output) from your TypeScript build.                              |
| **apps**         | Contains  source code that will be compiled to the dist dir                                     |
| **libs**         | Common libraries to be used across your app.                                                    
| package.json     | Contains dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped) |
| nest-cli.json    | Config settings for NestJS                                                                      |
| eslintrc.js      | Config settings for ESLint code style checking                                                  |

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