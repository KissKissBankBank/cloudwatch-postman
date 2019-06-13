# Contributing to CloudWatch Postman

- [Work with a pull request](#work-with-a-pull-request)
- [Running the app locally](#running-the-app-locally)
  - [With a process manager](#with-a-process-manager)
  - [Running scripts separately](#running-scripts-separately)
- [Testing](#testing)
- [Merging](#merging)

## Work with a pull request

To contribute code:

- Create a pull request on GitHub with a clear title in English.
- Add a explicit description of the problem you are trying to solve or the
  feature you want to add.
- Update the `CHANGELOG.md` under the `[unreleased]` section with the
following syntax:

  ```md
  - Breaking change: a breaking change.
  - Feature: a new feature.
  - Fix: a fix.
  ```
- On your CHANGELOG entry, link the PR related to your modification.

## Running the app locally

Create your own `.env` file and set [all the required
variables](https://github.com/KissKissBankBank/cloudwatch-postman#variables).

### With a process manager

The application uses a `Procfile` to run two different processes:
- the API web server,
- a worker to queue [log
  events](https://github.com/KissKissBankBank/cloudwatch-postman/blob/master/docs/api.md#post-logevents).

You can start the app using [Heroku
CLI](https://devcenter.heroku.com/articles/heroku-local):
```sh
heroku local
```

or a process manager like [Overmind](https://github.com/DarthSim/overmind):
```sh
overmind start
```

### Running scripts separately

Start the API web server on port `8080`:
```sh
npm run dev:start
```

Start the worker:
```sh
npm run jobs:start
```

## Testing

Make sure your `.env` file is set correctly and then, run the tests:
```sh
npm run dev:test
```

## Merging

To merge code into `master`:

- Make sure the code has been reviewed by someone.
- Make sure it has been tested.
- Merge using `Squash and merge` on GitHub.
- Delete the branch.
