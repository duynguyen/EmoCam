var mockedNotes = [],
	index = 0;
for (;index<10;++index) {
	mockedNotes.push({
		id: index,
		title: "This is note " + (index+1),
		url: "#",
		content: "There is a lot of text here. Note " + index + ". Hello World."
	});
}


var myControllers = angular.module("myControllers", []);
myControllers.controller("bodyController", [
	"$scope", function($scope) {
		$scope.notes = mockedNotes;
		$scope.selected = 0;
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
			$("#noteVis div").text(note.content);
		}
	}
]);