'use strict';

var chessRules = require('chess-rules');
//Search
var alphaBetaData = require('./alpha-beta-data');
var AlphaBetaData = alphaBetaData.AlphaBetaData;
var sorter = require('./quick-sort');
//Evaluation
var evaluatorMoves = require('./../evaluation/evaluator-moves');
var evaluatorBoard = require('./../evaluation/evaluator-board');
//Monitoring
var _monitor = require('./../monitoring/monitoring');
//Settings
var aiDepth = 3;
var aiTimeout = 10000;
var aiStrategy = 'basic';

/**
 * Set the timeout around which the search shall return a move.
 *
 * @param timeout The timeout in millisecond
 */
function setTimeout(timeout) {
    if(timeout === undefined || typeof timeout != 'number' || timeout%1 != 0) {
        throw new Error('timeout value type!');
    } else {
        aiTimeout = timeout;
    }
}

/**
 * Set the strategy to use in the evaluation.
 * @param strategyName The strategy name ('basic' by default, 'random')
 */
function setStrategy(strategyName) {
    if(strategyName === undefined || typeof strategyName !== 'string') {
        throw new Error('strategy value type!');
    } else {
        aiStrategy = strategyName;
    }
}

/**
 * Set the depth of the alpha-beta algorithm.
 * @param depth The depth (2 by default)
 */
function setDepth(depth) {
    if(depth === undefined || typeof depth != 'number' || depth%1 != 0) {
        throw new Error('depth value type!');
    } else {
        aiDepth = depth;
    }
}

/**
 * Get the AI next move for the position passed in, this method follow the alpha beta max algorithm.
 * @param position The position and AI turn
 * @returns {*} The move
 */
function getNextMove(position) {
    _monitor.clear();
    _monitor.startWatch('getNextMove');
    _monitor.startWatch('setup');

    var alpha = -1000000;
    var beta = 1000000;
    var bestMove = null;
    var startTime = new Date().getTime();

    //Initialize the data for AlphaBeta Search
    _monitor.stopWatch('setup');

    //Get the available moves
    _monitor.startWatch('availableMoves');
    var availableMoves = chessRules.getAvailableMoves(position);
    _monitor.stopWatch('availableMoves');

    //Evaluate the moves
    var evaluatedMoves = evaluatorMoves.evaluateMoves(availableMoves, position, aiStrategy);

    //Order moves to enhance pruning
    evaluatedMoves = sorter.sortMoves(evaluatedMoves);

    evaluatedMoves.some(function (move) {

        var _path;
        if(_monitor.isEnabled()) {
            _monitor.startWatch('pgn');
            _path = chessRules.moveToPgn(position, move.move);
            _monitor.stopWatch('pgn');
        }
        _monitor.startWatch('applyMove');
        var nextPosition = chessRules.applyMove(position, move.move);
        _monitor.stopWatch('applyMove');

        //var score = alphaBetaMin(nextPosition, alpha, beta, aiDepth - 1,
        //    new AlphaBetaData(_pgn, startTime));
        var score = -alphaBeta(nextPosition, -beta, -alpha, aiDepth - 1,
            new AlphaBetaData(_path, startTime));

        //Use of alpha-beta max for the first step
        if(score >= beta) {
            //Cut-off
            _monitor.addCutoffNode(_path, alpha, beta, 'max', score);
            alpha = beta;
            _monitor.stopWatch('return');
            return true;
        }

        if(score > alpha) {
            //we have found a better best move (a new max)
            alpha = score;
            bestMove = move;
        }
        _monitor.stopWatch('return');
        return false;
    });

    _monitor.stopWatch('getNextMove');
    _monitor.dumpLogs(true, false);
    return bestMove == null ? null : bestMove.move;
}

function isTerminal(position) {
    return chessRules.getGameStatus(position) !== 'OPEN';
}

/**
 * Single alpha-beta algorithm (Negamax).
 *
 * @param position The current position
 * @param alpha The current best score
 * @param beta The current worst score
 * @param depth The depth
 * @param alphaBetaData Data gathered at recursion depth+1
 * @returns {number} The score evaluated
 */
function alphaBeta(position, alpha, beta, depth, alphaBetaData) {

    if(depth == 0
        || new Date().getTime() - alphaBetaData.startTime > aiTimeout*0.98-200
        || isTerminal(position)) {

        /**
         * TODO: Enhance with Quiescence algorithm.
         */
        _monitor.startWatch('return');
        var score = evaluatorBoard.evaluateBoard(position, depth, aiStrategy);
        _monitor.addSearchNode(alphaBetaData.path, alpha, beta, (aiDepth-depth)%2==0?'max':'min', score);
        return score;
    }

    //Get the available moves
    _monitor.startWatch('availableMoves');
    var availableMoves = chessRules.getAvailableMoves(position);
    _monitor.stopWatch('availableMoves');

    //Evaluate the moves
    var evaluatedMoves = evaluatorMoves.evaluateMoves(availableMoves, position, aiStrategy);

    //Order moves to enhance pruning
    evaluatedMoves = sorter.sortMoves(evaluatedMoves);

    evaluatedMoves.some(function (move) {

        var _path;
        if(_monitor.isEnabled()) {
            _monitor.startWatch('pgn');
            _path = chessRules.moveToPgn(position, move.move);
            _monitor.stopWatch('pgn');
        }
        _monitor.startWatch('applyMove');
        var nextPosition = chessRules.applyMove(position, move.move);
        _monitor.stopWatch('applyMove');

        var score = -alphaBeta(nextPosition, -beta, -alpha, depth - 1, alphaBetaData.next(_path));

        //Cut off
        if (score >= beta) {
            _monitor.addCutoffNode(alphaBetaData.path, alpha, beta, (aiDepth-depth)%2==0?'max':'min', score);
            alpha = beta;
            _monitor.stopWatch('return');
            return true;
        }

        //we have found a better best move
        if(score > alpha) {
            alpha = score;
        }
        _monitor.stopWatch('return');
        return false;
    });
    _monitor.addSearchNode(alphaBetaData.path, alpha, beta, (aiDepth-depth)%2==0?'max':'min', alpha);
    return alpha;
}

module.exports.setDepth = setDepth;
module.exports.setStrategy = setStrategy;
module.exports.setTimeout = setTimeout;
module.exports.getNextMove = getNextMove;