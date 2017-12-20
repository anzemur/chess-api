'use strict';
var piece = require('./piece');
var colors = require('colors');
colors.setTheme({
    BW: ['black', 'bgWhite'],
    BB: ['black', 'bgMagenta'],
    WW: ['white', 'bgWhite'],
    WB: ['white', 'bgMagenta']
});
var _ = require('underscore-plus');

function clone(position) {
    return _.deepClone(position);
}

function getInitialPosition() {
    return {
        turn: 'W',
        castlingFlags: {
            'W': {'K': true, 'Q': true},
            'B': {'K': true, 'Q': true}
        },

        lastPawnMoveColumn: null,
        check: false,

        board: [
            piece.pieceFactory("R", "W"),
            piece.pieceFactory("N", "W"),
            piece.pieceFactory("B", "W"),
            piece.pieceFactory("Q", "W"),
            piece.pieceFactory("K", "W"),
            piece.pieceFactory("B", "W"),
            piece.pieceFactory("N", "W"),
            piece.pieceFactory("R", "W"),

            piece.pieceFactory("P", "W"),
            piece.pieceFactory("P", "W"),
            piece.pieceFactory("P", "W"),
            piece.pieceFactory("P", "W"),
            piece.pieceFactory("P", "W"),
            piece.pieceFactory("P", "W"),
            piece.pieceFactory("P", "W"),
            piece.pieceFactory("P", "W"),

            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,

            piece.pieceFactory("P", "B"),
            piece.pieceFactory("P", "B"),
            piece.pieceFactory("P", "B"),
            piece.pieceFactory("P", "B"),
            piece.pieceFactory("P", "B"),
            piece.pieceFactory("P", "B"),
            piece.pieceFactory("P", "B"),
            piece.pieceFactory("P", "B"),

            piece.pieceFactory("R", "B"),
            piece.pieceFactory("N", "B"),
            piece.pieceFactory("B", "B"),
            piece.pieceFactory("Q", "B"),
            piece.pieceFactory("K", "B"),
            piece.pieceFactory("B", "B"),
            piece.pieceFactory("N", "B"),
            piece.pieceFactory("R", "B")
        ]
    };
}

function getColoredPiece(row, col, side, pieceStr) {
    var coloredStr;

    if((row+col)%2==0) {
        if(side === 'W') {
            coloredStr = pieceStr.WB;
        } else {
            coloredStr = pieceStr.BB;
        }
    } else if(side === 'W') {
        coloredStr = pieceStr.WW;
    } else {
        coloredStr = pieceStr.BW;
    }

    return coloredStr;
}

function positionToString(position, utfFlag) {
    var strings = [];
    strings.push(position.turn == 'W' ? 'WHITE' : 'BLACK');
    strings.push(' ');
    strings.push(position.castlingFlags.W.K ? 'K' : '');
    strings.push(position.castlingFlags.W.Q ? 'Q' : '');
    strings.push(position.castlingFlags.B.K ? 'k' : '');
    strings.push(position.castlingFlags.B.Q ? 'q' : '');

    var row;
    var col;
    for (row = 7; row >= 0; row--) {
        strings.push('\n');
        strings.push(row+1);
        strings.push(' ');
        for (col = 0; col < 8; col++) {
            var currentPiece = position.board[row * 8 + col];
            if(utfFlag) {
                if (currentPiece == null) {
                    strings.push(getColoredPiece(row, col, 'W', '  '));
                } else {
                    strings.push(getColoredPiece(row, col, currentPiece.side, piece.pieceToUTF8(currentPiece) + ' '));
                }
            } else {
                if(currentPiece == null) {
                    strings.push('. ');
                } else if (currentPiece.side == 'W') {
                    strings.push(currentPiece.type.toUpperCase() + ' ');
                } else {
                    strings.push(currentPiece.type.toLowerCase() + ' ');
                }
            }
        }
    }
    strings.push('\n  a b c d e f g h ');
    return strings.join('');
}

module.exports = {
    getInitialPosition: getInitialPosition,
    positionToString: positionToString,
    clone: clone
};
