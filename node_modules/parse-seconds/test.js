var parse = require('./')
var test = require('tape')
var copy = require('shallow-copy')
var day = require('day-seconds')()
var week = require('week-seconds')()
var year = require('year-seconds')()
var template = {
  years: 0,
  weeks: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
}

test('it accepts seconds as an argument', function (assert) {
  assert.plan(1)

  var parsed = parse(60)
  var expected = copy(template)
  expected.minutes = 1
  assert.deepEqual(parsed, expected)
})

test('it can ignore units', function (assert) {
  assert.plan(5)

  var parsed = parse({ years: false })(year)
  var expected = copy(template)
  expected.weeks = 52
  expected.days = 1
  assert.deepEqual(parsed, expected, 'ignored years')

  var parsed = parse({ weeks: false, minutes: false })(week + day + 61)
  var expected = copy(template)
  expected.days = 8
  expected.seconds = 61
  assert.deepEqual(parsed, expected, 'ignored weeks and minutes')

  var parsed = parse({ days: false })(day + 1)
  var expected = copy(template)
  expected.hours = 24
  expected.seconds = 1
  assert.deepEqual(parsed, expected, 'ignored days')

  var parsed = parse({ hours: false })(3600)
  var expected = copy(template)
  expected.minutes = 60
  assert.deepEqual(parsed, expected, 'ignored hours')

  var parsed = parse({ minutes: false })(3660)
  var expected = copy(template)
  expected.hours = 1
  expected.seconds = 60
  assert.deepEqual(parsed, expected, 'ignored minutes')
})
