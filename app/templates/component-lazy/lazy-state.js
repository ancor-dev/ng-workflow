
		.state('<%-stateName%>', {
			url          : '<%-stateUrl%>',
			<%- is(isStateAbstract) %>abstract     : true,
			
			templateUrl  : 'components<%-componentPath ? '.'+componentPath : ''%>.<%-componentName%>.<%-subcomponentName%>.html',
			controller   : 'components<%-componentPath ? '.'+componentPath : ''%>.<%-componentName%>.<%-subcomponentName%>',
			controllerAs : 'vm',

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