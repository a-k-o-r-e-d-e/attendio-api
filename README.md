<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

Api for the Attendio Attendance App.

### Set up
Create a '.env' file in the root directory. 

The variables required can be found in the /src/constants/EnvVars.ts

Ensure to add the following varaibles so as to successfully build the local postgres db on local
- POSTGRES_USER
- POSTGRES_PASSWORD

## Running on Local 
run the command
```bash
docker compose up -d
```

This will build and start local db on a docker image . 

Once the db is up and running, you can then run 
```bash
npm run start:dev
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
