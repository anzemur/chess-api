'use strict';

var asciiToExtended = {
    "PW": "♙",
    "PB": "♟",
    "NW": "♘",
    "NB": "♞",
    "BW": "♗",
    "BB": "♝",
    "RW": "♖",
    "RB": "♜",
    "QW": "♕",
    "QB": "♛",
    "KW": "♔",
    "KB": "♚"
};

function pieceFactory(piece, side) {
    return {type: piece, side: side};
}

function pieceToUTF8(piece) {
    return(asciiToExtended[piece.type.concat(piece.side)]);
}

module.exports = {
    pieceFactory: pieceFactory,
    pieceToUTF8: pieceToUTF8
};
