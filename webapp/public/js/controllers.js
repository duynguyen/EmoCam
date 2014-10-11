var myControllers = angular.module("myControllers", []);
myControllers.factory("dataService", dataService);
myControllers.factory("chartService", chartService);
myControllers.factory("restService", restService);
myControllers.controller("bodyController", [
	"$scope", "restService", function($scope, restService) {
		$scope.notes = [];
		
		restService.getNoteMetadata(function(data) {
			$.each(data, function(index, value) {
				value.id = index;
			});
			$scope.notes = data;
			$scope.$digest();
			$(document).ready(function () {
				var element = $("#noteVis .dropdown-menu > li > a").get(0),
					noteItem = $(".note-list-item").get(0);
				$(element).trigger("click");
				$(noteItem).addClass("active");
			});
		});
	}
]).controller("noteListController", [
	"$scope", function ($scope) {
		$scope.showNote = function(note) {
			$scope.$parent.$broadcast("show-note", note);
		};
	}
]).controller("noteVisController", ["$scope", "chartService", "restService", "dataService", 
	function ($scope, chartService, restService, dataService) {
		$scope.chartType = -1;
		$scope.noteContent = null;
		$scope.$on("show-note", function(event, data) {
			displayNote(data);
		});

		function displayNote(note) {
			var noteListItem = $(".note-list-item");
			noteListItem.removeClass("active");
			$(noteListItem.get(note.id)).addClass("active");
			getNoteContentAndDraw($scope.chartType,note.guid);
		}

		function getNoteGUID() {
			var noteListItem = $(".note-list-item"),
				noteGuid;
			if ($scope.$parent.notes.length > 0) {
				noteGuid = $scope.$parent.notes[0].guid;
			}
			$.each(noteListItem, function (index, value) {
				if ($(value).hasClass("active")) {
					noteGuid = $scope.$parent.notes[index].guid;
				}
			});
			return noteGuid; // TODO to be replaced with concrete Id
		}

		function getNoteContentAndDraw(chartType, noteGuid) {
			restService.getNoteContent(noteGuid, function(data) {
				console.log("Note content ready");
				data = dataService.getChartDataFromContent(data);
				chartService.drawChart(chartType, data);
			});
		}

		$scope.showChart = function(chartType) {
			var noteGuid = getNoteGUID();
			$scope.chartType = chartType;
			getNoteContentAndDraw($scope.chartType, noteGuid);
		};
	}
]);