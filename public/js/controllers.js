var myControllers = angular.module("myControllers", []);
myControllers.controller("noteListController", [
	"$scope", function ($scope) {
		$scope.notes = [ 
			{
				title: "note 1",
				url: "#",
				content: "This is the first note"
			},
			{
				title: "note 2",
				url: "#",
				content: "This is the 2nd note"
			},
			{
				title: "note 3",
				url: "#",
				content: "This is the 3rd note"
			},
		];
	}
]).controller("noteVisController", [
	"$scope", function ($scope) {
		
	}
]);