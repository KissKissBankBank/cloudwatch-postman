# Release KissKissBankBank instance

**Only for [KissKissBankBank](https://github.com/KissKissBankBank)
collaborators**

### Prerequisites

- Ask an access to the KissKissBankBank Heroku team,
- Download the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) to
safely [add the Heroku git
remote](https://devcenter.heroku.com/articles/git#for-an-existing-heroku-app) to
your repository.

### Steps

- Switch on master: `git co master`
- Pull master: `git pull origin master`
- Update the `CHANGELOG.md` file:
  - Update the version following the Semantic Versioning.
  - Add a new [unreleased] section.
  - Check that each merged PR from the last release has an entry.

```sh
bin/deploy NEW_VERSION
```
