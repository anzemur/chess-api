'use strict';

var mongoose = require('mongoose');
var chessAi = require('chess-ai-kong');
var Chess = require('chess.js').Chess;
var chess = null;

var AIMoves = mongoose.model('AIMoves');
var Moves = mongoose.model('Moves');
var Status = mongoose.model('Status');
var status = new Status();

var movesArr = [];


exports.startNewGame = function(req, res) {
    chess = new Chess();
    status.status = "new game started";
    res.json(status);

    printChessboard();

};

/** Params: a pgn position in json as {position: currentPosition} **/
exports.listPosibleMoves = function(req, res) {
    if(chess != null) {
        var sq = req.body.position;

        var moves = new Moves();

        var posibleMoves = chess.moves({square: sq});

        for(var i = 0; i < posibleMoves.length; i++) {
            if(posibleMoves[i].length > 2) {
                var tmp = posibleMoves[i];
                while(tmp.length > 2) {
                    tmp = tmp.substring(1);
                }
                posibleMoves[i] = tmp;

            }

        }

        moves.moves = posibleMoves;
        res.json(moves);

    } else {
        status.status = "error: chess was not initialized!";
        res.json(status);

    }
};

/**  Params: from(pgn currentPosition) -> to(pgn desiredPosition) **/
exports.move = function(req, res) {
    if(chess != null) {
        var fromSq = req.body.from;
        var toSq = req.body.to;

        var move = chess.move({ from: fromSq, to: toSq });
        console.log(move);
        if(move != null) {
            status.status = "figure moved"
            res.json(status);
            movesArr.push(move.san);
            printChessboard();

        } else {
            status.status = "error: invalid move!";
            res.json(status);
        }

    } else {
        status.status = "error: chess was not initialized!";
        res.json(status);

    }
};


exports.checkGameOver = function(req, res) {
    if(chess != null) {
        if(chess.game_over()) {
            status.game_over_status = true;

            if(chess.in_checkmate()) {
                status.status = "check mate";
                res.json(status);
                console.log("Check mate!");

            } else if (chess.in_draw()) {
                status.status = "draw";
                res.json(status);
                console.log("Draw!");

            } else if (chess.in_stalemate()) {
                status.status = "in stalemate";
                res.json(status);

            } else if (chess.in_threefold_repetition()) {
                status.status = "in threefold repetition";
                res.json(status);

            } else if (chess.insufficient_material()) {
                status.status = "insufficient material";
                res.json(status);

            }

            chess.clear();

        } else {
            status.status = "game continues"
            res.json(status);

        }

    } else {
        status.status = "error: chess was not initialized!";
        res.json(status);

    }
};

exports.moveAI = function(req, res) {
    if(chess != null) {
        var move = chessAi.play(movesArr);
        var makeMove = chess.move(move);

        if(makeMove != null) {

            var from = makeMove.from;
            var to = makeMove.to;
            movesArr.push(makeMove.san);

            var aiMoves = new AIMoves();
            aiMoves.status = "AI moved!";
            aiMoves.to = to;
            aiMoves.from = from;

            res.json(aiMoves);

            printChessboard();

        } else {
            status.status = "error: invalid move!";
            res.json(status);
        }

    } else {
        status.status = "error: chess was not initialized!";
        res.json(status);
    }


};

function printChessboard() {
    console.log();
    console.log("##########################################");
    console.log();
    console.log(chess.ascii());

    var turn = ""
    if(chess.turn() == "w") {
        turn = "white";
    }  else {
        turn = "black";
    }

    console.log("Turn: " + turn );
}
