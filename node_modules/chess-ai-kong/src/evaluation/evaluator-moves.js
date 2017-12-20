'use-strict';
var chessRules = require('chess-rules');
var strategy = require('./strategy');
var _monitor = require('./../monitoring/monitoring');

/**
 * Evaluate a move for the current position.
 * - Evaluate capture (piece attacked)
 * - Evaluate castling
 * - Evaluate piece position
 * - Evaluate piece promotion
 *
 * @param position The position
 * @param move The move
 * @param aiStrategy The strategy
 * @returns {number} The value (higher the value, better the move)
 */
function evaluateMove(position, move, aiStrategy) {

    _monitor.startWatch('evaluateMove');
    var score = 0;
    _monitor.startWatch('evaluateMove-applyMove');
    var appliedPosition = chessRules.applyMove(position, move);
    _monitor.stopWatch('evaluateMove-applyMove');

    if(appliedPosition.check) {
        //Check
        score += 1000;
    }

    var piece = position.board[move.src];
    var pieceAfter = appliedPosition.board[move.dst];
    if (piece.type === 'K' && ((move.dst - move.src) == 2 || (move.dst - move.src) == -2)) {
        //Castling
        score += 100;
    } else {
        var pieceAttacked = position.board[move.dst];
        if(pieceAttacked !== null) {
            //Capture
            var pieceScore = strategy.getPieceScore(piece, aiStrategy);
            score += pieceScore;
            var pieceAttackedScore = strategy.getPieceScore(pieceAttacked, aiStrategy);
            if(pieceScore < pieceAttackedScore) {
                score += pieceAttackedScore - pieceScore;
            }
        }

        if(pieceAfter.type !== piece.type) {
            //Promotion
            score += strategy.getPieceScore(pieceAfter, aiStrategy);
        }
    }

    //Evaluate position
    score += strategy.getPositionScore(pieceAfter, move.dst, aiStrategy);
    score -= strategy.getPositionScore(piece, move.src, aiStrategy);

    _monitor.stopWatch('evaluateMove');
    return score;
}

/**
 * Evaluate each move based on the position and strategy.
 *
 * @param moves The array of available moves
 * @param position The current position
 * @param aiStrategy The current strategy
 * @returns {Array} The array of evaluated moves (pgn, move, value)
 */
function evaluateMoves(moves, position, aiStrategy) {

    _monitor.startWatch('evaluateMoves');
    var evaluatedMoves = new Array(moves.length);

    var i;
    for (i = 0; i < moves.length; i++) {
        var move = moves[i];
        var value = evaluateMove(position, move, aiStrategy);
        evaluatedMoves[i] = {
            move: move,
            value: value
        };
    }

    _monitor.stopWatch('evaluateMoves');
    return evaluatedMoves;
}

module.exports.evaluateMoves = evaluateMoves;