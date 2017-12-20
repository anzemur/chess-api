'use strict';

var positions = require('./position');
var coordinates = require('./coordinates');
var movesPieces = require('./moves-pieces');
var Coord = coordinates.BoardCoordinates;


function computeDiffs(position, move) {
    var diffs = [];
    var src = new Coord(move.src);
    var dst = new Coord(move.dst);
    var delta = dst.sub(src);

    var destinationPiece = position.board[move.dst];

    if (destinationPiece != null) {
        diffs.push({action: 'remove', src: move.dst});
    }

    diffs.push({action: 'move', src: move.src, dst: move.dst});

    // Special case for 'en passant'
    if (destinationPiece == null && position.board[move.src].type == 'P' && Math.abs(delta.x)) {
        var takenPieceCoord = src.add(new Coord(delta.x, 0));
        diffs.push({action: 'remove', src: takenPieceCoord.offset});
    }

    if (position.board[move.src].type == 'P' && Math.abs(delta.y) == 2) {
        diffs.push({action: 'pawnColumn', col: move.src % 8});
    } else {
        diffs.push({action: 'pawnColumn', col: null});
    }

    if (position.board[move.src].type == 'P' && (dst.y == 0 || dst.y == 7)) {
        diffs.push({action: 'promote', src: move.dst});
    }

    if (position.board[move.src].type == 'K') {
        diffs.push({action: 'resetCastling', sides: ['K', 'Q']});
        if (src.x == 4 && dst.x == 6) {
            // Move the rook for kingside castling
            diffs.push({
                action: 'move',
                src: dst.add(new Coord(1, 0)).offset,
                dst: dst.add(new Coord(-1, 0)).offset
            });
        }

        if (src.x == 4 && dst.x == 2) {
            // Move the rook for queenside castling
            diffs.push({
                action: 'move',
                src: dst.add(new Coord(-2, 0)).offset,
                dst: dst.add(new Coord(1, 0)).offset
            });
        }
    }

    if (position.board[move.src].type == 'R' && src.x == 0) {
        diffs.push({action: 'resetCastling', sides: ['Q']});
    }

    if (position.board[move.src].type == 'R' && src.x == 7) {
        diffs.push({action: 'resetCastling', sides: ['K']});
    }

    // Update the check flag if the move threatends the opponent's king.

    var updatedPosition = applyDiffs(position, diffs);
    updatedPosition.turn = position.turn;
    var checkFlag = false;
    movesPieces.computeAllMoves(updatedPosition).forEach(function (m) {
        var targetPiece = position.board[m.dst];

        if (targetPiece && targetPiece.type == 'K' && targetPiece.side != position.turn) {
            checkFlag = true;
        }
    });

    diffs.push({action: 'updateCheckFlag', value: checkFlag});

    return diffs;
}

function applyDiffs(position, diffs) {
    var targetPosition = positions.clone(position);

    diffs.forEach(function (diff) {
        if (diff.action === 'remove') {
            var offset = diff.src;
            targetPosition.board[offset] = null;
        } else if (diff.action === 'move') {
            targetPosition.board[diff.dst] = targetPosition.board[diff.src];
            targetPosition.board[diff.src] = null;
        } else if (diff.action === 'pawnColumn') {
            targetPosition.lastPawnMoveColumn = diff.col;
        } else if (diff.action === 'resetCastling') {
            diff.sides.forEach(function (side) {
                targetPosition.castlingFlags[position.turn][side] = false;
            });
        } else if (diff.action === 'updateCheckFlag') {
            targetPosition.check = diff.value;
        } else if (diff.action === 'promote') {
            targetPosition.board[diff.src].type = 'Q';
        }
    });

    targetPosition.turn = position.turn === 'W' ? 'B' : 'W';

    return targetPosition;
}

function applyMove(position, move) {
    var diffs = computeDiffs(position, move);
    return applyDiffs(position, diffs);
}

module.exports = {
    computeDiffs: computeDiffs,
    applyDiffs: applyDiffs,
    applyMove: applyMove
};
