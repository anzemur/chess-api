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
        .get(chessOnePlayerController.moveAI);

    versionRouter.route('/chess/one/check')
        .get(chessOnePlayerController.checkGameOver);




    /** Player vs. Player game mode **/
    versionRouter.route('/chess/two')
        .get(chessTwoPlayersController.startNewGame);

    versionRouter.route('/chess/two/moves')
        .post(chessTwoPlayersController.listPosibleMoves);

    versionRouter.route('/chess/two/move')
        .post(chessTwoPlayersController.move);

    versionRouter.route('/chess/two/check')
        .get(chessTwoPlayersController.checkGameOver);



    /** Highscores routes **/

    versionRouter.route('/highscores')
        .get(highScoresController.lisTopHighScores);

    versionRouter.route('/highscores/add')
        .post(highScoresController.addNewPlayer);

};
