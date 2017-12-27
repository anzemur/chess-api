'use strict';

var mongoose = require('mongoose');

var StatusSchema = new mongoose.Schema({
    status: {
        type: String
    },

    game_over_status: {
        type: Boolean
    },

    game_id: {
        type: String
    },

    fen_string: {
        type: String

    },

    turn: {
        type: String

    },

    ascii: {
        type: String

    },

    pgn: {
        type: String

    }


});

module.exports = mongoose.model('Status', StatusSchema);



var PossibleMovesSchema = new mongoose.Schema({
    moves: [{
        type: String
    }]

});

module.exports = mongoose.model('Moves', PossibleMovesSchema);

var AIMovesSchema = new mongoose.Schema ({
    from: {
        type: String
    },

    to: {
        type: String

    },

    status: {
        type: String

    }

});


module.exports = mongoose.model('AIMoves', AIMovesSchema);


var ChessSchema = new mongoose.Schema ({
    chess: {
        type: String
    },

    chess_moves: [{
        type: String
    }],

    game_id: {
        type: String
    },

    createAt: {
        type: Date,
        default: Date.now(),
        index: { expires: '2h' },
        expireAfterSeconds: 7200
    }


});


module.exports = mongoose.model('Chess', ChessSchema);
