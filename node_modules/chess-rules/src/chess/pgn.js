'use strict';

var chessMoves = require('./moves');
var chessUpdates = require('./updates');
var parser = require('./pgnParser');

var specialMoves = {
    'O-O': {
        'W': {src: 4, dst: 6},
        'B': {src: 60, dst: 62}
    },
    'O-O-O': {
        'W': {src: 4, dst: 2},
        'B': {src: 60, dst: 58}
    }
};

/**
 * Convert an offset to a PGN coord: 0 -> a1, ... , 63 -> h8
 */
function coordToName(offset) {
    var move = '';

    move += String.fromCharCode('a'.charCodeAt(0) + (offset % 8));
    move += String.fromCharCode('1'.charCodeAt(0) + Math.floor(offset / 8));

    return move;
}

function pgnToMove(position, pgnMove) {
    var move = null;
    var specialMove = specialMoves[pgnMove];

    if (specialMove) {
        move = specialMove[position.turn];
    } else {
        var pgnFields = parser.parsePgnMove(pgnMove);

        if (pgnFields) {
            var availableMoves = chessMoves.getAvailableMoves(position);
            availableMoves.forEach(function (m) {
                if (pgnFields.srcCol != null && m.src % 8 != pgnFields.srcCol) {
                    return;
                }

                if (pgnFields.srcRow != null && Math.floor(m.src / 8) != pgnFields.srcRow) {
                    return;
                }

                if (m.dst == pgnFields.dst && position.board[m.src].type == pgnFields.type) {
                    pgnFields.src = m.src;
                }
            });

            if (pgnFields.src != null && pgnFields.dst != null) {
                move = {src: pgnFields.src, dst: pgnFields.dst};
            }
        }
    }

    return move;
}

function moveToPgn(position, move) {
    var pgn = '';

    var piece = position.board[move.src];
    if (piece.type != 'P') {
        pgn += piece.type;
    }

    if (piece.type === 'K' && (move.dst - move.src) == 2) {
        return 'O-O';
    }

    if (piece.type === 'K' && (move.dst - move.src) == -2) {
        return 'O-O-O';
    }

    var availableMoves = chessMoves.getAvailableMoves(position);
    var possibleSources = [];
    availableMoves.forEach(function (m) {
        if (m.dst == move.dst && piece.type == position.board[m.src].type) {
            possibleSources.push(m.src);
        }
    });

    var src = coordToName(move.src);

    if (possibleSources.length > 1) {
        var s1 = coordToName(possibleSources[0]);
        var s2 = coordToName(possibleSources[1]);

        if (s1[0] == s2[0]) {
            pgn += src[1];
        } else {
            pgn += src[0];
        }
    }

    if (position.board[move.dst] != null) {
        if (pgn == '' && piece.type == 'P') {
            pgn += src[0];
        }

        pgn += 'x';
    }

    pgn += coordToName(move.dst);

    var nextPosition = chessUpdates.applyMove(position, move);

    // Pawn promotion
    if (piece.type == 'P' && (move.dst < 8 || move.dst > 56)) {
        pgn += '=Q';
    }

    // Check
    if (chessMoves.isCurrentPlayerInCheck(nextPosition)) {
        pgn += '+';
    }

    return pgn;
}

module.exports = {
    pgnToMove: pgnToMove,
    moveToPgn: moveToPgn
};
