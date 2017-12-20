'use strict';

var chessRules = require('chess-rules');
var aiSearch = require('./search/alpha-beta');
var _monitor = require('./monitoring/monitoring');

// Defaults options
var defaults = {
    depth: 3,                  // Depth of the search algorithm
    monitor: false,            // Enable/Disable the monitoring
    strategy: 'basic' ,        // Strategy to use, 'basic' as default
    timeout: 10000             // Timeout after which the AI returns a move
};

/**
 * Merge options arrays passed in.
 */
function mergeOptions(options) {
    for (var i=1; i < arguments.length; i++) {
        var def = arguments[i];
        for (var n in def) {
            if (options[n] === undefined) {
                options[n] = def[n];
            }
        }
    }
    return options;
}

/**
 * Apply the options passed in argument.
 *
 * @param options The options as an array of objects
 */
function refreshOptions(options) {
    aiSearch.setTimeout(options.timeout);
    aiSearch.setDepth(options.depth);
    aiSearch.setStrategy(options.strategy);
    _monitor.setEnabled(options.monitor);
}

/**
 * Set the AI options including search Depth, timeout and monitoring.
 *
 * @param options The options as an array of objects
 */
function setOptions(options) {
    var opts = mergeOptions(options || {}, defaults);
    refreshOptions(opts);
}

/**
 * Get the next move from the current status of the game.
 *
 * @param position The actual positions
 * @returns {*} the pgn move chosen by the AI
 */
function playPosition(position) {

    var aiMove = aiSearch.getNextMove(position);
    return aiMove == null ? null : chessRules.moveToPgn(position,  aiMove);
}

/**
 * Get the next move from the complete sequence of moves of the game.
 *
 * @param pgnMoves the complete sequence of moves since the beginning of the game
 */
function playMoves(pgnMoves) {

    var position = chessRules.getInitialPosition();

    pgnMoves.forEach(function (moveText) {
        var moveCoords = chessRules.pgnToMove(position, moveText);
        position = chessRules.applyMove(position, moveCoords);
    });

    return playPosition(position);
}

refreshOptions(defaults);

module.exports.setOptions = setOptions;
module.exports.play = playMoves;
module.exports.playPosition = playPosition;
