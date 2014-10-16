window.matchMedia || (window.matchMedia = function() {
	window.console && console.warn('angular-sticky: this browser does not support matchMedia, '+
				'therefore the minWidth option will not work on this browser. '+
				'Polyfill matchMedia to fix this issue.');
	return function() {
		return {
			matches: true
		};
	};
}());

angular.module('sticky', [])

.directive('sticky', ['$timeout', function($timeout){
	return {
		restrict: 'A',
		scope: {
			offset: '@',
			stickyClass: '@',
			mediaQuery: '@'
		},
		link: function($scope, $elem, $attrs){
			$timeout(function(){
				var offsetTop = parseFloat($scope.offset) || 0,
					stickyClass = $scope.stickyClass || '',
					mediaQuery = $scope.mediaQuery || 'min-width: 0',
					$window = angular.element(window),
					doc = document.documentElement,
					initialPositionStyle = $elem.css('position'),
					initialTopValue = $elem.css('top'),
					stickyLine,
					scrollTop;

				// Get the sticky line
				//
				function setInitial(){
					// Cannot use offsetTop, because this gets
					// the Y position relative to the nearest parent
					// which is positioned (position: absolute, relative).
					// Instead, use Element.getBoundingClientRect():
					// https://developer.mozilla.org/en-US/docs/Web/API/element.getBoundingClientRect
					stickyLine = $elem[0].getBoundingClientRect().top - offsetTop;
					console.log('stickyLine is', stickyLine, 'offsetTop is', offsetTop);
					checkSticky();
				}

				// Check if the window has passed the sticky line
				//
				function checkSticky(){
					scrollTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

					if ( scrollTop >= stickyLine && matchMedia('('+ mediaQuery +')').matches ){
						$elem
							.addClass(stickyClass)
							.css('position', 'fixed')
							.css('top', offsetTop+'px');
					} else {
						$elem
							.removeClass(stickyClass)
							.css('position', initialPositionStyle)
							.css('top', initialTopValue);
					}
				}

				// Handle the resize event
				//
				function resize(){
					$elem.css('position', initialPositionStyle);
					$timeout(setInitial);
				}

				// Remove the listeners when the scope is destroyed
				//
				function onDestroy(){
					$window.off('scroll', checkSticky);
					$window.off('resize', resize);
				}

				// Attach our listeners
				//
				$scope.$on('$destroy', onDestroy);
				$window.on('scroll', checkSticky);
				$window.on('resize', resize);

				setInitial();
			});
		}
	};
}]);
