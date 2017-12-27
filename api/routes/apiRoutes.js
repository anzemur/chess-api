'use strict';

var express = require('express');

module.exports = function(app) {
    var highScoresController = require('../controllers/highScoresController');
    var chessOnePlayerController = require('../controllers/chessOnePlayerController');
    var chessTwoPlayersController = require('../controllers/chessTwoPlayersController');

    var apiRouter = express.Router();
    var versionRouter = express.Router();

    app.use('/api', apiRouter);
    apiRouter.use("/v1", versionRouter);


    /** Chess routes **/

    /** Player vs. Computer game mode **/
    versionRouter.route('/chess/one')
         .get(chessOnePlayerController.startNewGame);

    versionRouter.route('/chess/one/moves')
        .post(chessOnePlayerController.listPosibleMoves);

    versionRouter.route('/chess/one/move/player')
        .post(chessOnePlayerController.move);

    versionRouter.route('/chess/one/move/ai')
        .post(chessOnePlayerController.moveAI);

    versionRouter.route('/chess/one/check')
        .post(chessOnePlayerController.checkGameOver);

    versionRouter.route('/chess/one/fen')
        .post(chessOnePlayerController.returnFEN);

    versionRouter.route('/chess/one/turn')
        .post(chessOnePlayerController.returnTurn);

    versionRouter.route('/chess/one/ascii')
        .post(chessOnePlayerController.returnAscii);

    versionRouter.route('/chess/one/pgn')
        .post(chessOnePlayerController.returnPgn);

    versionRouter.route('/chess/one/load/over/fen')
        .post(chessOnePlayerController.loadFenOverCurrent);

    versionRouter.route('/chess/one/load/over/pgn')
        .post(chessOnePlayerController.loadPgnOverCurrent);

    versionRouter.route('/chess/one/clear')
        .post(chessOnePlayerController.clearBoard);

    versionRouter.route('/chess/one/reset')
        .post(chessOnePlayerController.resetBoard);

    versionRouter.route('/chess/one/undo')
        .post(chessOnePlayerController.undoLastMove);

    versionRouter.route('/chess/one/start/fen')
        .post(chessOnePlayerController.startNewGameWithFEN);

    versionRouter.route('/chess/one/start/pgn')
        .post(chessOnePlayerController.startNewGameWithFEN);






    /** Player vs. Player game mode **/
    versionRouter.route('/chess/two')
        .get(chessTwoPlayersController.startNewGame);

    versionRouter.route('/chess/two/moves')
        .post(chessTwoPlayersController.listPosibleMoves);

    versionRouter.route('/chess/two/move')
        .post(chessTwoPlayersController.move);

    versionRouter.route('/chess/two/check')
        .post(chessTwoPlayersController.checkGameOver);

    versionRouter.route('/chess/two/fen')
        .post(chessTwoPlayersController.returnFEN);

    versionRouter.route('/chess/two/turn')
        .post(chessTwoPlayersController.returnTurn);

    versionRouter.route('/chess/two/ascii')
        .post(chessTwoPlayersController.returnAscii);

    versionRouter.route('/chess/two/pgn')
        .post(chessTwoPlayersController.returnPgn);

    versionRouter.route('/chess/two/load/over/fen')
        .post(chessTwoPlayersController.loadFenOverCurrent);

    versionRouter.route('/chess/two/load/over/pgn')
        .post(chessTwoPlayersController.loadPgnOverCurrent);

    versionRouter.route('/chess/two/clear')
        .post(chessTwoPlayersController.clearBoard);

    versionRouter.route('/chess/two/reset')
        .post(chessTwoPlayersController.resetBoard);

    versionRouter.route('/chess/two/undo')
        .post(chessTwoPlayersController.undoLastMove);

    versionRouter.route('/chess/two/start/fen')
        .post(chessTwoPlayersController.startNewGameWithFEN);

    versionRouter.route('/chess/two/start/pgn')
        .post(chessTwoPlayersController.startNewGameWithFEN);


    /** Highscores routes **/

    versionRouter.route('/scoreboard')
        .get(highScoresController.createNewLocalScoreboard);

    versionRouter.route('/highscores')
        .post(highScoresController.lisTopHighScores);

    versionRouter.route('/highscores/add')
        .post(highScoresController.addNewPlayer);

};
