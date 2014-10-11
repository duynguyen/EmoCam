var myFilters = angular.module("myFilters", []).
	filter('filterTitle', function() {
		return function(input, title) {
			return "";
		};
});