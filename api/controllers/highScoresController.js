'use strict';

var hhmmss = require('hhmmss');
var mongoose = require('mongoose');
var Player = mongoose.model('Player');
var Status = mongoose.model('Status');

var status =  new Status();

exports.createNewLocalScoreboard = function(req, res) {
    var scoreBoardId = mongoose.Types.ObjectId();

    status.status = "Scoreboard created!";
    status.scoreboard_id = scoreBoardId;

    res.json(status);
};



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
    var scoreBoardId = req.body.scoreboard_id;
    console.log(scoreBoardId);;
    Player.find(
                { scoreboard_id: scoreBoardId },                            //filter by scoreboard ID
                ['name', 'score', 'score_out', 'date', 'date_out'],         //Return name, score and date
                {
                    skip: 0,                                                //Start at idx 0
                    limit: 5,                                               //finish at idx 5
                    sort: {
                        score: 'asc'                                        //Sort by score, ascending
                    }
                }

    , function(err, topN) {
        if(err) res.send(err);

        for(var i in topN) {
            var date = ((topN[i].date + '').split('-') + '').split(" ");
            topN[i].date_out = date[2] + " " + date[1] + " " + date[3];
            topN[i].score_out = hhmmss(topN[i].score);
        }

        res.json(topN);
    });
};
