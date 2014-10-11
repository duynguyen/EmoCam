var myControllers = angular.module("myControllers", []);
myControllers.controller("bodyController", [
	"$scope", function($scope) {
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
]).controller("noteListController", [
	"$scope", function ($scope) {
		$scope.showNote = function(note) {
			$scope.$parent.$broadcast("show-note", note);
		};
	}
]).controller("noteVisController", [
	"$scope", "$document", function ($scope, $document) {
		$scope.$on("show-note", function(event, data) {
			displayNote(data);
		});
		function displayNote(note) {
			$("#noteVis").text(note.content);
		}
	}
]);