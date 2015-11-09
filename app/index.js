// var process = require('process');
var fs      = require('fs');
var ejs     = require('ejs');
var cfg     = require('./cfg');

var commands = [
	'component',
	'component-lazy',
];

if ( commands.indexOf(cfg.command) == -1 )
{
	console.log('Error: incorrect command');
	process.exit(1);
}

var command = require(cfg.commands+cfg.command);
