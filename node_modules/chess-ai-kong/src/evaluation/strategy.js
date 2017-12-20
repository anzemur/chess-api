'use strict';

var basic = require('./strategies/basic');
var random = require('./strategies/random');

var strategyPositions = {
    'basic': basic.getStrategyPositionTable,
    'random': random.getStrategyPositionTable
};
var strategyPieces = {
    'basic': basic.getStrategyPiecesTable,
    'random': random.getStrategyPiecesTable
};

/**
 * Get the strategy table with the scores per piece positions.
 * @param name The name of the strategy
 * @returns {*} The table
 */
function getStrategyPositionTable(name) {
    return strategyPositions[name]();
}

/**
 * Get the strategy table with the scores for each piece.
 * @param name The name of the strategy
 * @returns {*} The table
 */
function getStrategyPiecesTable(name) {
    return strategyPieces[name]();
}

/**
 * Get the score of the piece for the current turn, index and strategy.
 * @param piece The chess piece
 * @param index The position index
 * @param strategy The strategy name
 * @returns {number} The score
 */
function getPositionScore(piece, index, strategy) {
    var score = 0;
    var strategyTables = getStrategyPositionTable(strategy);
    if('B' === piece.side) {
        //The table are defined for White player, so Black scores can be found by negating the index
        var blackIndex = 63 - index;
        score = strategyTables[piece.type][blackIndex];
    } else {
        score = strategyTables[piece.type][index];
    }
    //console.log('getScore(piece:' + piece.type
    //    + ',turn:' + piece.side
    //    + ',index:' + index
    //    + ') = ' + score
    //);
    return score;
}

/**
 * Get the score of the piece with the strategy passed in.
 * @param piece The chess piece
 * @param strategy The strategy name
 * @returns {number} The score
 */
function getPieceScore(piece, strategy) {
    var piecesWeigh = getStrategyPiecesTable(strategy);
    var score = piecesWeigh[piece.type];
    //console.log('getPieceScore(piece:' + piece.type + ') = ' + score);
    return score;
}

module.exports.getPositionScore = getPositionScore;
module.exports.getPieceScore = getPieceScore;