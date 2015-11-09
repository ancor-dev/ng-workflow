<%- is(isStyle) %>require('./index.less');

var routes = require('./index.routes');
<%- is(isConfigBlock) %>var config = require('./index.config');
<%- is(isRunBlock) %>var run    = require('./index.run');

module.exports = ngRegister('components<%-componentPath ? '.'+componentPath : ''%>.<%-componentName%>', [
		require('angular-ui-router'),
	])
	.config(routes)
	<%- is(isConfigBlock) %>.config(config)
	<%- is(isRunBlock) %>.run(run)
	.name;