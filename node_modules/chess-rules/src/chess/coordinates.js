'use strict';


function BoardCoordinates(x, y) {
    if (y === undefined) {
        this.offset = x;
        this.x = this.offset % 8;
        this.y = Math.floor(this.offset / 8);
    } else {
        this.offset = x + 8 * y;
        this.x = x;
        this.y = y;
    }
}

BoardCoordinates.prototype.add = function (offset) {
    return new BoardCoordinates(this.x + offset.x, this.y + offset.y);
};

BoardCoordinates.prototype.sub = function (offset) {
    return new BoardCoordinates(this.x - offset.x, this.y - offset.y);
};

BoardCoordinates.prototype.isValid = function () {
    return this.x >= 0 && this.x < 8 && this.y >= 0 && this.y < 8;
};

module.exports = {
    BoardCoordinates: BoardCoordinates
};
