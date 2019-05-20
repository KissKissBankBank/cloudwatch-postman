# Contributing to CloudWatch Postman

- [Work with a pull request](#work-with-a-pull-request)
- [Running the app locally](#running-the-app-locally)
- [Testing](#testing)
- [Merging](#merging)

## Work with a pull request

To contribute code:

- Create a pull request on GitHub with a clear title in English.
- Add a explicit description of the problem you are trying to solve or the
  feature you want to add.
- Don't forget to update the `CHANGELOG.md` under the `[unreleased]` section
  with the following syntax:

  ```md
  - Breaking change: a breaking change.
  - Feature: a new feature.
  - Fix: a fix.
  ```

## Running the app locally

Create your own `.env` file and set [all the required
variables](https://github.com/KissKissBankBank/cloudwatch-postman#variables).

Start the app on port `8080`:
```sh
npm run dev:start
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

## Release

**Only for [KissKissBankBank](https://github.com/KissKissBankBank)
collaborators**

```sh
bin/deploy NEW_VERSION
```
