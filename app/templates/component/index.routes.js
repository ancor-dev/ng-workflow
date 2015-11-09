/*@ngInject*/
module.exports = function routes($stateProvider)
{
	$stateProvider
<% if ( isState ) { %>
		.state('<%-stateName%>', {
			<%- is(stateUrl) %>url : '<%- stateUrl %>',
			<%- is(isStateAbstract) %>abstract : true,

			<%- is(isTemplate) %>template     : require('./index.html'),
			<%- is(isController) %>controller   : require('./index.controller'),
			<%- is(isController) %>controllerAs : 'vm',
		})
<% } %>
	;
};