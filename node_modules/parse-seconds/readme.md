# parse-seconds
parse-seconds converts seconds into years, weeks, days, hours, and/or minutes.

This is mostly useful for formatting media durations; the larger units of time are included for completeness (maybe you have a *really* long video or something).

[![Build status](https://travis-ci.org/michaelrhodes/parse-seconds.png?branch=master)](https://travis-ci.org/michaelrhodes/parse-seconds)

## install
```sh
$ npm install parse-seconds
```

## usage
```js
var parse = require('parse-seconds')

// Basic usage
parse(60)
> {
  years: 0,
  weeks: 0,
  days: 0,
  hours: 0,
  minutes: 1,
  seconds: 0
}

// Avoid specific units of time
parse({ hours: false })(60 * 60 + 61)
> {
  years: 0,
  weeks: 0,
  days: 0,
  hours: 0,
  minutes: 61,
  seconds: 1
}
```
