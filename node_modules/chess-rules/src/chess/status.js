'use strict';

var moves = require('./moves');

function getGameStatus(position) {
    var availableMoves = moves.getAvailableMoves(position);
    var status = 'OPEN';

    if (availableMoves.length == 0) {
        if (position.check) {
            status = position.turn == 'W' ? 'BLACKWON' : 'WHITEWON';
        } else {
            status = 'PAT';
        }
    }

    return status;
}

module.exports = {
    getGameStatus: getGameStatus
};
