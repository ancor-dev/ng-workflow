
		.state('<%-stateName%>', {
			url          : '<%-stateUrl%>',
			<%- is(isStateAbstract) %>abstract     : true,
			
<% if ( stateViewName ) { %>
			views : {
				'<%-stateViewName%>' : {
					<%- is(isTemplate) %>templateUrl  : '<%-subcomponentFullPath%>.html',
					<%- is(isController) %>controller   : '<%-subcomponentFullPath%>',
					<%- is(isController) %>controllerAs : 'vm',
				},
			},
<% } else { %>
			<%- is(isTemplate) %>templateUrl  : '<%-subcomponentFullPath%>.html',
			<%- is(isController) %>controller   : '<%-subcomponentFullPath%>',
			<%- is(isController) %>controllerAs : 'vm',
<% } %>

			/*@ngInject*/
			resolve      : function($q, $ocLazyLoad) {
				var deferred = $q.defer();
				
				require.ensure([], function (require) {
					$ocLazyLoad.load({
						name : require('./<%-subcomponentName%>.lazy'),
					});

					deferred.resolve('ok');
				});

				return deferred.promise;
			}, // end resolve

		})