'use strict';

var cutoffs = [];
var consoleTree = [];
var nbNodeSearched = 0;
var nbCutoffs = 0;
var watches = require('./watches');

//Settings
var enabled = false;

function isEnabled() {
    return enabled;
}

function setEnabled(enabledFlag) {
    if(enabledFlag === undefined || typeof enabledFlag !== 'boolean') {
        throw new Error('monitor value type!');
    } else {
        enabled = enabledFlag;
    }
}

/**
 * Add a cutoff node.
 *
 * @param path The node path
 * @param alpha The alpha
 * @param beta The beta
 * @param type The type of search (Maximizing or Minimizing)
 * @param score The score
 */
function addCutoffNode(path, alpha, beta, type, score) {
    if(enabled) {
        cutoffs.push(
            {
                path: path,
                alpha: alpha,
                beta: beta,
                type: type,
                score: score
            }
        );
    }
}


/**
 * Add a search node.
 *
 * @param path The node path
 * @param alpha The alpha
 * @param beta The beta
 * @param type The type (min or max)
 * @param score The score
 */
function addSearchNode(path, alpha, beta, type, score) {
    if(enabled) {
        consoleTree.push(
            {
                path: path,
                alpha: alpha,
                beta: beta,
                type: type,
                score: score
            }
        );
    }
}

/**
 * Start the watch. If the watch does not exist, it is created.
 *
 * @param itemKey The watch key
 */
function startWatch(itemKey) {
    if(enabled) {
       watches.startWatch(itemKey)
    }
}

/**
 * Stop the watch.
 *
 * @param itemKey The watch key
 */
function stopWatch(itemKey) {
    if(enabled) {
        watches.stopWatch(itemKey)
    }
}

/**
 * Reset all monitoring variables.
 */
function reset() {

    if(enabled) {
        cutoffs.splice(0, cutoffs.length);
        consoleTree.splice(0, consoleTree.length);
        nbNodeSearched = 0;
        nbCutoffs = 0;

        watches.reset();
    }
}

/**
 * Clear all monitoring devices.
 */
function clear() {
    if (enabled) {

        cutoffs.splice(0, cutoffs.length);
        consoleTree.splice(0, consoleTree.length);
        nbNodeSearched = 0;
        nbCutoffs = 0;

        watches.clear();
    }
}

/**
 * Print logs monitored logs in the console.
 *
 * @param full true to dump the full logs.
 * @param string true to dump logs as String, false to dump objects
 */
function dumpLogs(full, string) {
    if (enabled) {

        console.log(consoleTree.length + ' node searched');
        console.log(cutoffs.length + ' cut-offs');

        //Log watches
        watches.dumpLogs();

        if(full) {
            if (string) {
                var strings;
                if (cutoffs.length > 0) {
                    strings = ['--CUTOFFS--'];
                    cutoffs.forEach(function (cutoff) {
                        strings.push('\n');
                        strings.push('{'
                            + 'path: ' + cutoff.path
                            + ', type: ' + cutoff.type
                            + ', alpha: ' + cutoff.alpha
                            + ', beta: ' + cutoff.beta
                            + ', score: ' + cutoff.score
                            + '}');
                    });
                    console.log(strings.join(''));
                }

                if (consoleTree.length > 0) {
                    strings = ['--TREE--'];
                    consoleTree.forEach(function (node) {
                        strings.push('\n');
                        strings.push('{'
                            + 'path: ' + node.path
                            + ', type: ' + node.type
                            + ', alpha: ' + node.alpha
                            + ', beta: ' + node.beta
                            + ', score: ' + node.score
                            + '}');
                    });
                    console.log(strings.join(''));
                }
            } else {
                console.log(consoleTree);
                console.log(cutoffs);
            }
        }
    }
}

module.exports.addSearchNode = addSearchNode;
module.exports.addCutoffNode = addCutoffNode;
module.exports.setEnabled = setEnabled;
module.exports.isEnabled = isEnabled;
module.exports.startWatch = startWatch;
module.exports.stopWatch = stopWatch;
module.exports.dumpLogs = dumpLogs;
module.exports.clear = clear;
module.exports.reset = reset;