'use strict';

function StopWatch(startAt, duration, startCount) {
    this.startAt = startAt ? startAt : 0;
    this.duration = duration ? duration : 0;
    this.startCount = startCount ? startCount : 0;
}

StopWatch.prototype.start = function () {
    this.startAt = new Date().getTime();
    this.startCount++;
};

StopWatch.prototype.stop = function () {
    this.duration += new Date().getTime()- this.startAt;
};

StopWatch.prototype.reset = function () {
    this.duration = 0;
    this.startAt = 0;
    this.startCount = 0;
};

StopWatch.prototype.watchToString = function () {
    return this.startCount + 'x, ' + this.duration + 'ms';
};

module.exports = {
    StopWatch: StopWatch
};