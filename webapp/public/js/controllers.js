var myControllers = angular.module("myControllers", []);
myControllers.controller("bodyController", [
	"$scope", function($scope) {
		$scope.notes = [];
		$.getJSON("/evernote", function(data) {
			$.each(data, function(index, value) {
				value.id = index;
			});
			$scope.notes = data;
			$scope.$digest();
			$(document).ready(function () {
				var element = $("#noteVis .dropdown-menu > li > a").get(0);
				element = $(element);
				element.trigger("click");
			});
		});
	}
]).controller("noteListController", [
	"$scope", function ($scope) {
		$scope.showNote = function(note) {
			$scope.$parent.$broadcast("show-note", note);
		};
	}
]).controller("noteVisController", [
	"$scope", "chartService", function ($scope, chartService) {
		$scope.chartType = -1;
		$scope.$on("show-note", function(event, data) {
			displayNote(data);
		});
		function displayNote(note) {
			var noteListItem = $(".note-list-item");
			noteListItem.removeClass("active");
			$(noteListItem.get(note.id)).addClass("active");
			chartService.drawChart($scope.chartType,note.id);
		}

		function getNoteID() {
			return 0; // TODO to be replaced with concrete Id
		}

		$scope.showChart = function(chartType) {
			var noteId = getNoteID();
			chartService.drawChart(chartType, noteId);
			$scope.chartType = chartType;
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