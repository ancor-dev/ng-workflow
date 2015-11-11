module.exports = class {

	/*@ngInject*/
	constructor(<%-DI.controller.join(', ')%>)
	{<% for ( var one of DI.controller ) { %>
		this.<%-one%> = <%-one%>;<% } %>
		
		Log.info('controller', '<%-stateName%>/index.controller', 'init');


	}

};