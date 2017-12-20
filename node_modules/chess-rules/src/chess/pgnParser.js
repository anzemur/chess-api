'use strict';

var CHARCODE_A = 'a'.charCodeAt(0);
var CHARCODE_1 = '1'.charCodeAt(0);

function computeOffset(pgn, cursor) {
    var offs = null;

    var col = pgn.charCodeAt(cursor) - CHARCODE_A;
    var row = (pgn.charCodeAt(cursor + 1) - CHARCODE_1);

    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
        offs += col;
        offs += row * 8;
    }

    return offs;
}

function parsePgnMove(pgn) {
    var fields = {
        type: null,
        srcCol: null,
        srcRow: null,
        dst: null,
        promotion: null,
        capture: false,
        checking: false,
        mate: false
    };

    // Coodinates are bound by a cursor offset to the left and a payload length
    var cursor = 0;
    var length = pgn.length;

    // Piece type prefix will shift cursor

    if (['P', 'R', 'N', 'B', 'K', 'Q'].indexOf(pgn[cursor]) != -1) {
        fields.type = pgn[cursor];
        cursor++;
    } else {
        fields.type = 'P';
    }

    // Checking, mate and promotions will decrease length

    var checkingIndex = pgn.indexOf('+');
    var mateIndex = pgn.indexOf('#');
    var promotionIndex = pgn.indexOf('=');

    if (checkingIndex >= 0) {
        fields.checking = true;
        length = checkingIndex;
    }

    if (mateIndex >= 0) {
        fields.mate = true;
        length = mateIndex;
    }

    if (promotionIndex >= 0) {
        fields.promotion = pgn.substring(promotionIndex + 1, promotionIndex + 2);
        length = promotionIndex;
    }

    // Now the destination is at the right of the payload

    var dstOffset = computeOffset(pgn, length - 2);

    if (dstOffset != null) {
        fields.dst = dstOffset;
    } else {
        // Reject invalid syntax here
        return null;
    }

    length -= 2;

    if (pgn[length - 1] === 'x') {
        length -= 1;
        fields.capture = true;
    }

    // Only src col/row hints should remain

    for (var i = cursor; i < length; i++) {
        var c = pgn.charCodeAt(cursor);
        var row = c - CHARCODE_1;
        var col = c - CHARCODE_A;

        if (row >= 0 && row < 8) {
            fields.srcRow = row;
        }

        if (col >= 0 && col < 8) {
            fields.srcCol = col;
        }
    }

    return fields;
}

module.exports = {
    parsePgnMove: parsePgnMove
};
