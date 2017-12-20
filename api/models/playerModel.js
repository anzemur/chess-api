'use strict';

var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema ({
    name: {
        type: String ,
        required:'Players name was not entered!'
    },
    score: {
        type: Number
    },
    score_out: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    date_out: {
        type: String
    }
});

module.exports = mongoose.model('Player', PlayerSchema);
