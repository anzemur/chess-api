'use strict';

var coordinates = require('./coordinates');
var updates = require('./updates');
var movesPieces = require('./moves-pieces');

var Coord = coordinates.BoardCoordinates;

function findPiece(position, pieceType, pieceSide) {
    var result = null;

    for (var offset = 0; offset < 64; offset++) {
        var piece = position.board[offset];
        if (piece != null && piece.type === pieceType && piece.side === pieceSide) {
            result = offset;
            break;
        }
    }

    return result;
}

function getAvailableMoves(position) {

    var availableMoves = movesPieces.computeAllMoves(position);

    // Prune moves that would lead to a check situation.

    var legalmoves = [];

    var isMoveLeadingToThreat = function (move, pieceType, pieceSide) {
        var updatedPosition = updates.applyMove(position, move);
        var opponentMoves = movesPieces.computeAllMoves(updatedPosition);
        var kingOffset = findPiece(updatedPosition, pieceType, pieceSide);
        var kingThreat = false;

        opponentMoves.forEach(function (move) {
            if (move.dst == kingOffset) {
                kingThreat = true;
            }
        });

        return kingThreat;
    };

    availableMoves.forEach(function (move) {
        var src = new Coord(move.src);
        var dst = new Coord(move.dst);
        var delta = dst.sub(src);

        var kingThreat = isMoveLeadingToThreat(move, 'K', position.turn);

        // Kingside castling
        if (position.board[move.src].type == 'K' && delta.x == 2) {
            kingThreat = kingThreat || isMoveLeadingToThreat({src: move.src, dst: move.src + 1}, 'K', position.turn)
        }

        // Queenside castling
        if (position.board[move.src].type == 'K' && delta.x == -2) {
            kingThreat = kingThreat || isMoveLeadingToThreat({src: move.src, dst: move.src - 1}, 'K', position.turn)
        }

        if (!kingThreat) {
            legalmoves.push(move);
        }
    });

    return legalmoves;
}

function isCurrentPlayerInCheck(position) {
    var isCheck = false;
    var initialTurn = position.turn;
    position.turn = initialTurn === 'W' ? 'B' : 'W';

    for (var offset = 0; offset <= 64; offset++) {
        var piece = position.board[offset];
        var coord = new Coord(offset);

        if (piece != null && piece.side === position.turn) {
            var targets = movesPieces.pieceDestinationsEvaluator[piece.type](position, coord);

            targets.forEach(function (dest) {
                var destPiece = position.board[dest.offset];
                if (destPiece && destPiece.type === 'K' && destPiece.side !== position.turn) {
                    isCheck = true;
                }
            });
        }
    }

    position.turn = initialTurn;

    return isCheck;
}

module.exports = {
    getAvailableMoves: getAvailableMoves,
    isCurrentPlayerInCheck: isCurrentPlayerInCheck
};
