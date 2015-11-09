var join    = require('path').join;

var cfg = {};
cfg.dir  = process.cwd()+'/';
cfg.app  = __dirname+'/';
cfg.tpls = join(cfg.app, 'templates')+'/';
cfg.commands = join(cfg.app, 'commands')+'/';

cfg.command = process.argv[2];

module.exports = cfg;