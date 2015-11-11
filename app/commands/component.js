'use strict';
var path   = require('path');
var cfg    = require('../cfg');
var prompt = require('prompt');
var fs     = require('fs');
var ejs    = require('ejs');

var tplDir = cfg.tpls + cfg.command + '/';

var templates = {};

[
	'index.js',
	'index.routes.js',

	'index.config.js',
	'index.run.js',

	'index.html',
	'index.less',
	'index.controller.js',
].forEach(file => {
	templates[file] = fs.readFileSync(tplDir+file);
});

/**
 * Components that will be injected to appropriate elements
 * @type {Object}
 */
var DI = {
	controller : ['Log'],
	config     : [],
	run        : ['Log', '$rootScope'],
};

var schema = {
  properties: {
		'componentPath' : {
			default : 'base',
			message : 'componentPath: put "false" if it has not path',
			before  : v => { return v == 'false' ? false : v; },
		},
		'componentName' : {
			default : 'my-component',
		},
		'stateUrl' : {
			default : false,
			before : v => v == 'false' ? '' : v,
		},
		'stateName' : {
			default : false,
			message : 'stateName : if "false" will be %componentPath%.%componentName%',
			before : value => {
				if ( value != 'false' ) return value;

				let name = [];

				let p = prompt.history('componentPath').value;
				if ( p ) name.push(p);

				name.push( prompt.history('componentName').value );

				return name.join('.');
			},
		},
		'stateViewName' : {
			default : false,
			message : 'stateViewName : if parent use named-view. Or "false" if it does not need',
			before  : v => v == 'false' ? false : v,
		},
		'controllerDi' : {
			default : false,
			message : 'controllerDi : additional dependencies. example : "$scope,$window,$timeout". Default dependencies : '+DI.controller.join(','),
			before  : v => v == 'false' ? false : DI.controller.push.apply(DI.controller, v.split(',')),
		},
		'configDi' : {
			default : false,
			message : 'configDi : additional dependencies. example : "$scope,$window,$timeout". Default dependencies : '+DI.config.join(','),
			before  : v => v == 'false' ? false : DI.config.push.apply(DI.config, v.split(',')),
		},
		'runDi' : {
			default : false,
			message : 'runDi : additional dependencies. example : "$scope,$window,$timeout". Default dependencies : '+DI.run.join(','),
			before  : v => v == 'false' ? false : DI.run.push.apply(DI.run, v.split(',')),
		},
		'isState' : {
			default : 0,
		},
		'isStateAbstract' : 
		{
			default : 0
		},
		'isRunBlock' : {
			default : 0,
		},
		'isConfigBlock' : {
			default : 0,
		},
		'isStyle' : {
			default : 0,
		},
		'isTemplate' : {
			default : 0,
		},
		'isController' : {
			default : 0,
		},
		'isRequireToParent' : {
			default : 1,
			message : 'will require this component to parent component?'
		},
	},
};

function handler(err, result)
{
	// convert input values to int
	Object.keys(result).forEach(key => {
		if ( key.indexOf('is') === 0 ) result[key] = Boolean(+result[key]);
	});

	Object.keys(templates).forEach(name => {
		var file = String(templates[name]);

		var options = Object.assign({}, result, {
			is : (isOk) => {
				return isOk ? '' : '// ';
			},
			cssClass : 'component' + (result.componentPath ? '-'+result.componentPath.replace(/\./g, '-') : '') +'-'+ result.componentName,
			DI : DI,
		});

		// Замена всех переменных
		templates[name] = file = ejs.render(file, options);

		console.log('\n\n------------------------ '+name+' --------------------------\n',file,'\n\n\n');
	});

	make(result);
}

function make(options)
{
	// создание директории компонента
	var componentDir = path.join(cfg.dir, options.componentName);
	fs.mkdirSync( componentDir );

	// обязательные файлы
	[
		'index.js',
		'index.routes.js',
	].forEach(write);

	// Опциональные файлы
  if ( options.isRunBlock ) write('index.run.js');
  if ( options.isConfigBlock ) write('index.config.js');
  if ( options.isController ) write('index.controller.js');
  if ( options.isStyle ) write('index.less');
  if ( options.isTemplate ) write('index.html');

  if ( options.isRequireToParent )
  {
  	let parentIndexJs = path.join(cfg.dir, 'index.js');
  	if ( ! fs.existsSync(parentIndexJs) )
  	{
  		console.warn('index.js for add this component is not found');
  	}
  	else
  	{
  		let index = String( fs.readFileSync(parentIndexJs) );

  		let pattern = /(ngRegister\([\w'.-]+, \[\n+)([\s()\w,'-]+?)(,?)(\n?)([\s]*)\]\)/gmi;
  		let match = pattern.exec(index);
  		

  		if ( match === null )
  		{
  			console.warn('anchor '+pattern+' not found');
  		}
  		else
  		{
	  		let startPos = match.index + match[1].length + match[2].length + match[3].length + match[4].length;
	  		// console.log('Debug Test ...', startPos, match);

	  		index = index.slice(0, startPos) + "\t\trequire('"+options.componentName+"'),\n" + index.slice(startPos);

  			fs.writeFileSync(parentIndexJs, index);
  			console.log('\n\n------------------- add to parent ----------------------\n'+index+'\n\n');
  		}
  	}
  }

  /**
   * Функция для записи файлы
   * @param  {string} name имя файлы в объекте templates
   */
	function write(name)
	{
		var filePath = path.join(componentDir, name);
		fs.writeFileSync(filePath, templates[name]);
		console.log(filePath+' wrote');
	}
}

// 
// Start the prompt 
// 
prompt.start();
prompt.get(schema, handler);
