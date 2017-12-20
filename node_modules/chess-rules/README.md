[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage Status](https://coveralls.io/repos/ChessCorp/chess-rules/badge.svg?branch=master&service=github)](https://coveralls.io/github/ChessCorp/chess-rules?branch=master)

Chess Rules implementation as a standalone module.


## Install as node bundle

```sh
$ npm install --save chess-rules
```

This will install rules module in the node_modules folder and update your package.json.

## Install using bower

```sh
$ bower install chess-rules
bower chess-rules#*             cached git://github.com/ChessCorp/chess-rules.git#0.8.0
bower chess-rules#*           validate 0.8.0 against git://github.com/ChessCorp/chess-rules.git#*
bower chess-rules#*                new version for git://github.com/ChessCorp/chess-rules.git#*
bower chess-rules#*            resolve git://github.com/ChessCorp/chess-rules.git#*
bower chess-rules#*           download https://github.com/ChessCorp/chess-rules/archive/0.10.1.tar.gz
bower chess-rules#*            extract archive.tar.gz
bower chess-rules#*           resolved git://github.com/ChessCorp/chess-rules.git#0.10.1
bower chess-rules#~0.10.1      install chess-rules#0.10.1

chess-rules#0.10.1 bower_components/chess-rules
```

## Usage

### Import the main rules object

```js
var chessRules = require('chess-rules');
```

### Instantiate an initial position model

```js
var position = chessRules.getInitialPosition();
```


## License

MIT © [Yannick Kirschhoffer](http://www.alcibiade.org/)


[npm-image]: https://badge.fury.io/js/chess-rules.svg
[npm-url]: https://npmjs.org/package/chess-rules
[travis-image]: https://travis-ci.org/ChessCorp/chess-rules.svg?branch=master
[travis-url]: https://travis-ci.org/ChessCorp/chess-rules
[daviddm-image]: https://david-dm.org/ChessCorp/chess-rules.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ChessCorp/chess-rules
