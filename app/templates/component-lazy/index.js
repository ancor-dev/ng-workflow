<%- is(isStyle) %>require('./index.less');

<%- is(isController) %>var controller = require('./index.controller');
<%- is(isConfigBlock) %>var config = require('./index.config');
<%- is(isRunBlock) %>var run    = require('./index.run');

/*@ngInject*/
function templateLoader($templateCache)
{
	$templateCache.put('components<%-componentPath ? '.'+componentPath : ''%>.<%-componentName%>.<%-subcomponentName%>.html', require('./index.html'));
}

module.exports = ngRegister('components<%-componentPath ? '.'+componentPath : ''%>.<%-componentName%>.<%-subcomponentName%>.lazy', [
		require('angular-ui-router'),
	])
	.run(templateLoader)
	<%- is(isConfigBlock) %>.config(routes)
	<%- is(isRunBlock) %>.run(run)
	<%- is(isController) %>.controller('components<%-componentPath ? '.'+componentPath : ''%>.<%-componentName%>.<%-subcomponentName%>', controller)
	.name; 