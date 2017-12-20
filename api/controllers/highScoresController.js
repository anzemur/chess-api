'use strict';

var hhmmss = require('hhmmss');
var mongoose = require('mongoose');
var Player = mongoose.model('Player');

exports.addNewPlayer = function(req, res) {
    var newPlayer = new Player(req.body);

    newPlayer.save(function(err, player) {
        if(err) {
            res.send(err);
        }
        res.json(player);
    });
};

exports.lisTopHighScores = function(req, res) {
    Player.find(
                {},                                                         //No search filter
                ['name', 'score', 'score_out', 'date', 'date_out'],         //Return name, score and date
                {
                    skip: 0,                                                //Start at idx 0
                    limit: 5,                                               //finish at idx 5
                    sort: {
                        score: 'asc'                                        //Sort by score, ascending
                    }
                }

    , function(err, topFive) {
        if(err) res.send(err);

        for(var i in topFive) {
            var date = ((topFive[i].date + '').split('-') + '').split(" ");
            topFive[i].date_out = date[2] + " " + date[1] + " " + date[3];
            topFive[i].score_out = hhmmss(topFive[i].score);
        }

        res.json(topFive);
    });
}
