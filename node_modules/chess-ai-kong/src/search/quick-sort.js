'use strict';
var _monitor = require('./../monitoring/monitoring');

/**
 * Sort the list of evaluated moves passed in.
 *
 * @param evaluatedMoves The array of evaluated moves
 * @returns {*} The list of evaluated moves sorted
 */
function sortMoves(evaluatedMoves) {

    _monitor.startWatch('sortMoves');
    var resultMoves = quickSort(evaluatedMoves, 0, evaluatedMoves.length-1);
    _monitor.stopWatch('sortMoves');
    return resultMoves;
}

function quickSort(fullMoves, lowInd, highInd) {

    var i = lowInd;
    var j = highInd;
    var pivot = checkValue(fullMoves[lowInd + Math.floor((highInd - lowInd) / 2)]);

    while (i <= j) {
        while(checkValue(fullMoves[i]) > pivot) {
            i++;
        }

        while(checkValue(fullMoves[j]) < pivot) {
            j--;
        }

        if (i <= j) {
            swapMoves(fullMoves, i, j);
            i++;
            j--;
        }
    }

    if (lowInd < j) {
        quickSort(fullMoves, lowInd, j);
    }
    if (i < highInd) {
        quickSort(fullMoves, i, highInd);
    }
    return fullMoves;
}

function checkValue(move) {

    if(move.value === undefined) {
        throw new Error("move.value is undefined");
    }
    if(move.value === null) {
        throw new Error("move.value is null");
    }

    return move.value;
}

function swapMoves(moves, indA, indB) {
    var temp = moves[indA];
    moves[indA] = moves[indB];
    moves[indB] = temp;
}

module.exports.sortMoves = sortMoves;