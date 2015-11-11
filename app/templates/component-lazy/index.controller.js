module.exports = class {

	/*@ngInject*/
	constructor(<%-DI.controller.join(', ')%>)
	{<% for ( var one of DI.controller ) { %>
		this.<%-one%> = <%-one%>;<% } %>
		
		Log.info('controller', '<%-stateName%>/<%-subcomponentName%>.lazy/index.controller', 'init');

		
	}

};