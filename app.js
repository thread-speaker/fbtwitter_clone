var app = angular.module("chattyApp", ["firebase"]);

app.config(function($logProvider){
    $logProvider.debugEnabled(true);
});

app.controller("loginCtrl", function($scope, $window) {
  delete localStorage.user;

  $scope.login = function() {
    localStorage.user = $scope.user;
    $window.location.href = 'index2.html';
  };
});

app.controller("chattyCtrl", function($scope, $window, $firebaseArray) {
  if (!localStorage.user) {
    $window.location.href = 'login.html';
  }
  else {
    var loading = true;
    var ref = new Firebase("https://luminous-torch-6850.firebaseio.com/chatty");

    // get the messages as a synchronized array
    $scope.messages = $firebaseArray(ref);
    $scope.messages.$loaded().then(function() {
    	// messages have been loaded
      loading = false;
    });

    $scope.isLoading = function() {
      return loading;
    }

    // add new messages to the array
    $scope.addMessage = function() {
      if ($scope.message) {
        $scope.messages.$add({
          message: $scope.message,
          sender: localStorage.user,
          timeStamp: Date.now(),
        });
      }
    };
  }
});

app.directive("chat", function() {
  var link = function(scope) {};

  var controller = function($scope, $rootScope) {
    var activeMessage = null;
	
	$scope.toShow = 10;

    $scope.respondTo = function(id, response) {
      if (response) {
        $scope.messages.$add({
          message: response,
          sender: localStorage.user,
          timeStamp: Date.now(),
          inReplyTo: id,
        });
      }
    };
	
	$scope.parseTime = function(message) {
		if (message && message.timeStamp) {
			var parse = Date.parse(message.timeStamp);
			if (parse) {
				return 0-parse;
			}
			else {
				parse = parseInt(message.timeStamp);
				if (parse) {
					return 0-parse;
				}
				else return null;
			}
		}
		else {
			return null;
		}
	}

    $scope.isResponse = function(message) {
      return (activeMessage && message.inReplyTo == activeMessage);
    };

    $scope.setActive = function(message) {
      if (!message) {
        activeMessage = null;
      }
      else {
        activeMessage = message.$id;
      }
    };
  }

  return {
    scope: {
      messages: '=',
    },
    restrict: 'E',
    replace: 'true',
    template: (
	  '<div>' +
		  'How many recent message would you like to see? <input type="number" ng-model="toShow" min="0" max="100" ng-min="0" ng-max="100" />' +
		  '<hr />' +
		  '<div ng-repeat="message in messages | orderBy:\'-timeStamp\' | limitTo:toShow">' +
			'<div class="messageBlock" ng-class="{isResponse: $parent.isResponse(message)}"' +
			  '  ng-mouseover="$parent.setActive(message)">' +
			  '<div class="messageDeleteButton glyphicon glyphicon-trash" ng-click="messages.$remove(message)"></div>' +
			  '<div class="messageContent">' +
				'<h3 class="messageSender">{{ message.sender }}</h3>' +
				'<span class="messageText">{{ message.message }}</span>' +
				'<form ng-submit="$parent.respondTo(message.$id, response)">' +
				  '<input ng-model="response" placeholder="Message" />' +
				  '<button type="submit">Respond</button>' +
				'</form>' +
			  '</div>' +
			'</div>' +
		  '</div>' +
		'</div>'
    ),
    link: link,
    controller: controller,
  };
});