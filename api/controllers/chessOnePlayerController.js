'use strict';

var mongoose = require('mongoose');
var chessAi = require('chess-ai-kong');
var Chess = require('chess.js').Chess;
// var chess = null;

var ChessGame = mongoose.model('Chess');
var AIMoves = mongoose.model('AIMoves');
var Moves = mongoose.model('Moves');
var Status = mongoose.model('Status');
var status = new Status();

// var movesArr = [];


exports.startNewGame = function(req, res) {
    var chess = new Chess();
    var gameId = mongoose.Types.ObjectId();
    var chessGame = new ChessGame();
    chessGame.chess = chess.fen();
    chessGame.game_id = gameId;

    chessGame.save(function(err, chess) {
        if(err) {
            res.send(err);
        }
        var gameStatus = new Status();

        gameStatus.status = "new game started";
        gameStatus.game_id = gameId;

        res.json(gameStatus);
    });

    // printChessboard();

};


exports.startNewGameWithFEN = function(req, res) {

    var fenString = req.body.fen;
    var chess = new Chess();
    var validation = chess.validate_fen(fenString);

    if(validation.valid) {

        chess.load(fenString);
        var gameId = mongoose.Types.ObjectId();
        var chessGame = new ChessGame();
        chessGame.chess = chess.fen();
        chessGame.game_id = gameId;

        chessGame.save(function(err, chess) {
            if(err) {
                res.send(err);
            }
            var gameStatus = new Status();

            gameStatus.status = "new game started from FEN";
            gameStatus.game_id = gameId;

            res.json(gameStatus);
        });

        // printChessboard();

    } else {
        status.status = "error: invalid FEN string!";
        res.json(status);

    }
};


exports.startNewGameWithPgn = function(req, res) {

    var pgnString = req.body.pgn;
    var chess = new Chess();
    var valid = chess.load_pgn(pgnString);

    if(valid) {

        chess.load_pgn(pgnString);
        var gameId = mongoose.Types.ObjectId();
        var chessGame = new ChessGame();
        chessGame.chess = chess.fen();
        chessGame.game_id = gameId;

        chessGame.save(function(err, chess) {
            if(err) {
                res.send(err);
            }
            var gameStatus = new Status();

            gameStatus.status = "new game started from pgn";
            gameStatus.game_id = gameId;

            res.json(gameStatus);
        });

        // printChessboard();

    } else {
        status.status = "error: invalid pgn string!";
        res.json(status);

    }


};

/** Params: a pgn position in json as {position: currentPosition} **/
exports.listPosibleMoves = function(req, res) {

    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {
        if(currentGame != null){

            var chess = new Chess(currentGame.chess);

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

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }

        // printChessboard(chess);
    });


    getChess(gameId, function(currentGame) {
        // ....
    });
};

/**  Params: from(pgn currentPosition) -> to(pgn desiredPosition) **/
exports.move = function(req, res) {

    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {
        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            var movesArr = currentGame.chess_moves;

            if(chess != null) {
                var fromSq = req.body.from;
                var toSq = req.body.to;

                var move = chess.move({ from: fromSq, to: toSq });

                if(move != null) {

                    movesArr.push(move.san);
                    ChessGame.update({ game_id: gameId },
                        {
                         chess: chess.fen() ,
                                chess_moves: movesArr
                        },

                        function (err, chess){
                            if(err) {
                                res.send(err);
                            }
                            status.status = "figure moved";
                            res.json(status);
                    });

                    // printChessboard(chess);

                } else {
                    status.status = "error: invalid move!";
                    res.json(status);
                }

            } else {
                status.status = "error: chess was not initialized!";
                res.json(status);

            }

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};


exports.checkGameOver = function(req, res) {
    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {
        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);

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

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};

exports.moveAI = function(req, res) {

    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {

        if(currentGame != null) {

            var chess = new Chess(currentGame.chess);
            var movesArr = currentGame.chess_moves;

            if(chess != null) {
                var move = chessAi.play(movesArr);
                var makeMove = chess.move(move);

                if(makeMove != null) {

                    var from = makeMove.from;
                    var to = makeMove.to;
                    movesArr.push(makeMove.san);


                    ChessGame.update({ game_id: gameId },
                        {
                         chess: chess.fen() ,
                                chess_moves: movesArr
                        },

                        function (err, chess){
                            if(err) {
                                res.send(err);
                            }
                            var aiMoves = new AIMoves();
                            aiMoves.status = "AI moved!";
                            aiMoves.to = to;
                            aiMoves.from = from;

                            res.json(aiMoves);
                    });

                    printChessboard(chess);

                } else {
                    status.status = "error: invalid move!";
                    res.json(status);
                }

            } else {
                status.status = "error: chess was not initialized!";
                res.json(status);
            }
        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }

    });
};


exports.returnFEN = function(req, res){
    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {

        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            var fenStatus = new Status();

            fenStatus.fen_string = chess.fen();
            res.json(fenStatus);

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};



exports.returnAscii = function(req, res){
    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {

        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            var asciiStatus = new Status();

            asciiStatus.ascii = chess.ascii();
            res.json(asciiStatus);

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};

exports.returnPgn = function(req, res){
    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {

        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            var pgnStatus = new Status();

            pgnStatus.pgn = chess.pgn();
            res.json(pgnStatus);

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};

exports.undoLastMove = function(req, res){
    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {

        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            var movesArr = currentGame.chess_moves;
            var succes = chess.undo();
            console.log(succes);
            if(succes != null) {
                movesArr.pop();

                ChessGame.update({ game_id: gameId },
                    {
                     chess: chess.fen(),
                     chess_moves: movesArr
                    },

                    function (err, chess){
                        if(err) {
                            res.send(err);
                        }

                        status.status = "move undone";
                        res.json(status);
                });


            } else {
                status.status = "error: couldn't undo the move!";
                res.json(status);
            }
            printChessboard(chess);

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);
        }
    });
};




exports.resetBoard = function(req, res){
    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {

        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            chess.reset();

            ChessGame.update({ game_id: gameId },
                {
                 chess: chess.fen()
                },

                function (err, chess){
                    if(err) {
                        res.send(err);
                    }

                    status.status = "board reseted";
                    res.json(status);
            });

            printChessboard(chess);

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};




exports.clearBoard = function(req, res){
    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {

        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            chess.clear();

            ChessGame.update({ game_id: gameId },
                {
                 chess: chess.fen()
                },

                function (err, chess){
                    if(err) {
                        res.send(err);
                    }

                    status.status = "board cleared";
                    res.json(status);
            });

            printChessboard(chess);

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};

exports.loadFenOverCurrent = function(req, res){
    var gameId = req.body.game_id;
    var fenString = req.body.fen;

    getChess(gameId, currentGame => {

        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            var validation = chess.validate_fen(fenString);

            if(validation.valid) {

                chess.load(fenString);

                ChessGame.update({ game_id: gameId },
                    {
                     chess: chess.fen(),
                     chess_moves: []
                    },

                    function (err, chess){
                        if(err) {
                            res.send(err);
                        }

                        status.status = "FEN loaded!";
                        res.json(status);
                });

                // printChessboard(chess);

            } else {
                status.status = "error: invalid FEN string!";
                res.json(status);

            }


        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};


exports.loadPgnOverCurrent = function(req, res){
    var gameId = req.body.game_id;
    var pgnString = req.body.pgn;

    getChess(gameId, currentGame => {

        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            var valid = chess.load_pgn(pgnString);

            if(valid) {

                ChessGame.update({ game_id: gameId },
                    {
                     chess: chess.fen(),
                     chess_moves: []
                    },

                    function (err, chess){
                        if(err) {
                            res.send(err);
                        }

                        status.status = "Pgn loaded!";
                        res.json(status);
                });

                // printChessboard(chess);

            } else {
                status.status = "error: invalid pgn string!";
                res.json(status);

            }


        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};





exports.returnTurn = function(req, res){
    var gameId = req.body.game_id;

    getChess(gameId, currentGame => {

        if(currentGame != null) {
            var chess = new Chess(currentGame.chess);
            var turnStatus = new Status();

            turnStatus.turn = chess.turn();
            res.json(turnStatus);

        } else {
            status.status = "error: The game has expired OR you didn't put the game_id as the parameter!";
            res.json(status);

        }
    });
};






function getChess(gameId, callback) {
    ChessGame.findOne({ game_id: gameId }, function(err, chessGame) {
        if(err) {
            return null;
        }
        callback(chessGame);
    });
}

// TODO : .get(square)
//         .header()


//      .put(piece, square)
//      remove(square)

//      .square_color(square)

//      .validate_fen(fen):





function printChessboard(chess) {
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
