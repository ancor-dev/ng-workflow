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
		'stateUrl' : {
			default : false,
			before : v => v == 'false' ? '' : v,
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
			stateName : (result.componentPath ? result.componentPath+'.' : '') + result.componentName,
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
