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

	'index.config.js',
	'index.run.js',

	'index.html',
	'index.less',
	'index.controller.js',

	'lazy-state.js',
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
			message : 'put "false" if it has not path',
			before  : v => { return v == 'false' ? false : v; },
		},
		'componentName' : {
			default : 'my-component',
		},
		'subcomponentName' : {
			default : 'index',
		},
		'stateName' : {
			default : false,
			message : 'stateName : if "false" will be %componentPath%.%componentName%',
			before : value => {
				if ( value != 'false' ) return value;

				var p = prompt.history('componentPath').value;
				return p +'.'+ prompt.history('componentName').value;
			},
		},
		'stateUrl' : {
			default : false,
			message : 'stateUrl : if "false" will be /%componentName%',
			before : v => '/'+ prompt.history('componentName').value,
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
			default : 1,
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
			default : 1,
		},
		'isTemplate' : {
			default : 1,
		},
		'isController' : {
			default : 1,
		},
	},
};

function handler(err, result)
{
	// convert input values to boolean
	Object.keys(result).forEach(key => {
		if ( key.indexOf('is') === 0 ) result[key] = Boolean(+result[key]);
	});

	Object.keys(templates).forEach(name => {
		var file = String(templates[name]);

		var options = Object.assign({}, result, {
			is : (isOk) => {
				return isOk ? '' : '// ';
			},
			cssClass : 'component' + (result.componentPath ? '-'+result.componentPath.replace(/\./g, '-') : '') +'-'+ result.componentName +'-'+ result.subcomponentName,
			DI : DI,
			subcomponentFullPath : 'components'+(result.componentPath ? '.'+result.componentPath : '')+'.'+result.componentName+'.'+result.subcomponentName,
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
	var componentDir = path.join(cfg.dir, options.subcomponentName+'.lazy');
	fs.mkdirSync( componentDir );

	// обязательные файлы
	[
		'index.js',
	].forEach(write);

	// Опциональные файлы
  if ( options.isRunBlock ) write('index.run.js');
  if ( options.isConfigBlock ) write('index.config.js');
  if ( options.isController ) write('index.controller.js');
  if ( options.isStyle ) write('index.less');
  if ( options.isTemplate ) write('index.html');
  if ( options.isState )
  {
  	let routePath = path.join(cfg.dir, 'index.routes.js');
  	if ( ! fs.existsSync(routePath) )
  	{
  		console.warn('index.routes.js is not found for put `state`');
  	}
  	else
  	{
  		let routes = String( fs.readFileSync(routePath) );

  		let anchor = '$stateProvider';
  		let anchorPos = routes.search(new RegExp('\\'+anchor+'\n'));
  		

  		if ( anchorPos == -1 )
  		{
  			console.warn('anchor '+anchor+' not found');
  		}
  		else
  		{
  			routes = routes.slice(0, anchorPos + anchor.length) +'\n'+ templates['lazy-state.js'] + routes.slice(anchorPos+anchor.length);
  			fs.writeFileSync(routePath, routes);
  			console.log('\n\n------------------- route added ----------------------\n'+routes+'\n\n');
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
