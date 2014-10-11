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
			if (noteGuid) {
				$.getJSON("/evernote/content/" + noteGuid, function(data) {
					console.log("Note content ready");
					chartService.drawChart(chartType, data);
				});	
			}
		}

		$scope.showChart = function(chartType) {
			var noteGuid = getNoteGUID();
			$scope.chartType = chartType;
			getNoteContentAndDraw($scope.chartType, noteGuid);
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