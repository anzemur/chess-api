'use-strict';

function AlphaBetaData(path, startTime) {

    if (path !== undefined) {
        this.path = path;
    }

    if(startTime !== undefined) {
        this.startTime = startTime;
    } else {
        this.startTime = new Date().getTime();
    }
}

AlphaBetaData.prototype.next = function (pgn) {
    return new AlphaBetaData(this.path + '-' + pgn, this.startTime);
};

module.exports = {
    AlphaBetaData: AlphaBetaData
};