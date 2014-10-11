var mockedNotes = [],
	index = 0;
for (;index<9;++index) {
	mockedNotes.push({
		id: index,
		title: "This is note " + (index+1),
		url: "#",
		content: "This is where the visualization for note " + (index+1) + " appears."
	});
}
mockedNotes.push({
	id: 10,
	title: "ZZWW " + (index+1),
	url: "#",
	content: "This is where the visualization for note " + (index+1) + " appears."
});


var myControllers = angular.module("myControllers", []);
myControllers.controller("bodyController", [
	"$scope", function($scope) {
		$scope.notes = mockedNotes;
	}
]).controller("noteListController", [
	"$scope", function ($scope) {
		$scope.showNote = function(note) {
			$scope.$parent.$broadcast("show-note", note);
		};
	}
]).controller("noteVisController", [
	"$scope", "chartService", function ($scope, chartService) {
		$scope.$on("show-note", function(event, data) {
			displayNote(data);
		});
		function displayNote(note) {
			var noteListItem = $(".note-list-item");
			$("#noteVis div").text(note.content);
			noteListItem.removeClass("active");
			$(noteListItem.get(note.id)).addClass("active");
		}

		function getChartID() {
			return 1; // TODO to be replaced with concrete Id
		}

		$scope.showChart = function(chartType) {
			var chartId = getChartID(),
				output = chartService.drawChart(chartType, chartId, {

				});
			// $("#chartContainer").empty();
			// $("#chartContainer").append(output);
		};
	}
]).controller("noteSearchBoxController", [
	"$scope", function($scope) {

	}
]).run(function() {
	$(document).ready(function() {
		var selectedItem = $(".note-list-item").get(0);
			selectedItem = $(selectedItem);
			selectedItem.addClass("active");
	});
});