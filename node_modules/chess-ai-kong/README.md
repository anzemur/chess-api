# ChessCorp Artificial Intelligence: Kong

## Abstract

This project is an example of an Artificial Intelligence module.

It uses the following modules from [ChessCorp project](http://github.com/ChessCorp):

* Chess Rules set [View](http://github.com/ChessCorp/chess-rules)

## Engine

The AI search engine is based on the [Alpha Beta Pruning algorithm] (https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning). It chooses best move by simulating in-depth plies and refuting moves that cannot alter its final decision.

## Strategies

The AI implements several strategies that can be configured as an option. Strategies are based on material and positions. They influence the board evaluation and as a matter of fact the AI's way of playing.

### Basic Strategy

The basic strategy is based on the common principles about chess programming. 

-Pawns progress forward.
-Bishops and Knights control center, avoid corners and extreme corners.
-Queen and Rook avoid center.
-King hide in the back.

### Random Strategy

The random strategy does not take into account material and position. Losing a pawn is as bad as losing a queen.


## Configuration

The AI can be configured be setting options:

- depth: The depth of the search algorithm. A higher depth provide a deeper and longer thinking from the AI (Integer, 3 by default).
- monitor: Enable/disable the monitoring. Monitoring might be time-consuming because it generates PGN test and stores searched nodes. (Boolean, false by default).
- strategy: Set the strategy to use to evaluate board and moves (String, 'basic' by default).
- timeout: Set up a timeout after which the AI shall return a move (Integer, 10000 by default).


# Install

## As a Node module

```sh
$ npm install chess-ai-kong
```

This will install chess-ai-kong module in the node_modules folder.


# Usage

## Import the main ai-kong object

```js
> var chessAI = require('chess-ai-kong');

> chessAI
{ 
  playPosition: [Function: playPosition],
  play: [Function: play],
  setOptions: [Function: setOptions]
}
```

## Configure

```js
 > chessAI.setOptions(
{
  depth: 4,
  monitor: true,
  strategy: 'basic',
  timeout: 10000
}
);
```

## Play after a sequence of moves

The AI starts from an initial position and replays every moves provided before searching for the next move. The method returns a PGN move.
PGN move text is described here [https://en.wikipedia.org/wiki/Portable_Game_Notation](https://en.wikipedia.org/wiki/Portable_Game_Notation)

```js
> var move = chessAi.play(['e4']);
'Nf6'
```
Note: The AI search a move for the player's turn after the sequence of moves. If there is an odd number of moves, the AI searches for a WHITE move, otherwise, it searches for a BLACK move.

## Play after a certain position

The AI starts from the given position and search for the next move. The method returns a PGN move.
PGN move text is described here [https://en.wikipedia.org/wiki/Portable_Game_Notation](https://en.wikipedia.org/wiki/Portable_Game_Notation)

```js
> var move = chessAi.playPosition(position);
'e4'
```

Note: The AI search a move for the player's turn. For example, if the initial position is passed in parameter, the AI will search for a WHITE move.
