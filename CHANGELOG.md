# Changelog

This project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]

## [3.0.0](https://github.com/KissKissBankBank/cloudwatch-postman/compare/v2.0.0...v3.0.0) - 2019-05-20

Breaking changes:
- [#11](https://github.com/KissKissBankBank/cloudwatch-postman/pull/11)/[#12](https://github.com/KissKissBankBank/cloudwatch-postman/pull/12) - Remove the application token authorization on `GET /test` endpoint.
- [#11](https://github.com/KissKissBankBank/cloudwatch-postman/pull/11)/[#12](https://github.com/KissKissBankBank/cloudwatch-postman/pull/12) - Add rate limit by IP on server endpoints. All endpoints follows these options for `restify-throttle`:
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
- [#8](https://github.com/KissKissBankBank/cloudwatch-postman/pull/8) - Update token creation strategy

## [2.0.0](https://github.com/KissKissBankBank/cloudwatch-postman/compare/v1.0.0...v2.0.0) - 2019-05-20

Breaking change:
- [#7](https://github.com/KissKissBankBank/cloudwatch-postman/pull/7) - Add an authorization with an access token to request POST /metric

Feature:
- [#7](https://github.com/KissKissBankBank/cloudwatch-postman/pull/7) - Add POST /token endpoint to enable client to request an access token

## 1.0.0 - 2019-05-19

- First release!
