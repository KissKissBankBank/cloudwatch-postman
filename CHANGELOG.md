# Changelog

This project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
Breaking changes:
- Remove the application token authorization on `GET /test` endpoint.
- Add rate limit by IP on server endpoints. All endpoints follows these options for `restify-throttle`:
```js
{
  burst: 3,  // Max 3 concurrent requests
  rate: 1,  // 1 request / second
  ip: true,   // throttle per IP
}
```

The `GET /test` endpoint has a specific throttle:
```js
{
  burst: 1,
  rate: 0.015, // 1 request / minute
  ip: true,
}
```

Feature:
- Update token creation strategy - [#8](https://github.com/KissKissBankBank/cloudwatch-postman/pull/8)

## [2.0.0] - 2019-05-20$

Breaking changes:
- Add an authorization with an access token to request POST /metric - [#7](https://github.com/KissKissBankBank/cloudwatch-postman/pull/7)

Feature:
- Add POST /token endpoint to enable client to request an access token - [#7](https://github.com/KissKissBankBank/cloudwatch-postman/pull/7)

## [1.0.0] - 2019-05-19

- First release!
