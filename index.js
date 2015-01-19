var fs = require('fs');
var findit = require('findit');
var path = require('path');
var chalk = require('chalk');
var argv = require('minimist')(process.argv.slice(2));

var TinyPng = require('./lib/tiny-png');

var args = getArgs();

// Run from command line
if (args) {
    walkDir(args.dir, args.key);
}

function getArgs() {

    if (! argv.d) {
        return false;
    }

    return {
        dir: argv.d,
        key: argv.k
    }
}

function isValidFile(file) {
    return ['.png', '.jpg'].indexOf(path.extname(file)) > -1;
}

function walkDir(dir, apiKey, callback) {
    var api = new TinyPng({
        key: apiKey
    });

    var finder = findit(dir);

    var totalSaving = 0;
    var validFileCount = 0;
    var compressedFileCount = 0;

    if(! dir) {
        throw 'No directory set';
    }

    if (! apiKey) {
        throw 'No API key set';
    }

    finder.on('file', function(file, stat) {
        if (file && isValidFile(file)) {
            api.compress(file, function(err, data) {
                if (err) {
                    validFileCount --;
                    return console.error(err);
                }

                console.log(
                    'Source: %s (%s) reduced by %s% (%s)',
                    chalk.magenta(data.input.filename),
                    Math.round(data.input.size / 1000) + 'kb',
                    Math.round((1 - data.output.ratio) * 100),
                    chalk.green(Math.round(data.output.size / 1000) + 'kb')
                );

                compressedFileCount ++;
                totalSaving += data.input.size - data.output.size;

                if (callback && validFileCount === compressedFileCount) {
                    callback({
                        saving: totalSaving / 1000
                    });
                }

            });

            validFileCount ++;
        }
    });

}

module.exports = walkDir;
