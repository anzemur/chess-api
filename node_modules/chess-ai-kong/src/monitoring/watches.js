'use strict';

var StopWatch = require('./stopwatch').StopWatch;
var watches = new Object();

/**
 * Add a watch with the key passed in.
 *
 * @param itemKey The key
 */
function addWatch(itemKey) {
    watches[itemKey] = new StopWatch(0,0,0);
}

/**
 * Start the watch. If the watch does not exist, iy is created.
 *
 * @param itemKey The watch key
 */
function startWatch(itemKey) {
    if(!watches[itemKey]) {
        addWatch(itemKey);
    }
    watches[itemKey].start();
}

/**
 * Stop the watch.
 *
 * @param itemKey The watch key
 */
function stopWatch(itemKey) {
    watches[itemKey].stop();
}

/**
 * Get the watch from the key.
 * @param itemKey The watch key
 * @returns {*} The watch
 */
function getWatch(itemKey) {
    if(watches[itemKey]) {
        return new StopWatch(watches[itemKey].startAt, watches[itemKey].duration, watches[itemKey].startCount);
    } else {
        return undefined;
    }
}

/**
 * Reset a watch to 0.
 *
 * @param itemKey The watch key
 */
function resetWatch(itemKey) {
    if(!watches[itemKey]) {
        addWatch(itemKey);
    } else {
        watches[itemKey].reset();
    }
}

/**
 * Clear all the watches.
 */
function clearWatches() {
    var keys = [];
    for (var watch in watches) {
        keys.push(watch);
    }

    keys.forEach(function (key) {
        delete watches[key];
    });
}

/**
 * Reset the watches.
 */
function resetWatches() {
    for (var watch in watches) {
        watches[watch].reset();
    }
}

function resetAll() {
    resetWatches();
}

/**
 * Clear all monitoring devices.
 */
function clearAll() {
    clearWatches();
}

function dumpLogs() {
    for (var watch in watches) {
        console.log('[' + watch + '] ' + watches[watch].watchToString());
    }
}

module.exports.startWatch = startWatch;
module.exports.stopWatch = stopWatch;
module.exports.getWatch = getWatch;
module.exports.resetWatch = resetWatch;
module.exports.clear = clearAll;
module.exports.reset = resetAll;
module.exports.dumpLogs = dumpLogs;
