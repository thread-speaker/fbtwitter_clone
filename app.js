var app = angular.module("chattyApp", ["firebase"]);

app.controller("chattyCtrl", function($scope, $firebaseArray) {
  var ref = new Firebase("https://luminous-torch-6850.firebaseio.com/chatty");

  // get the messages as a synchronized array
  $scope.messages = $firebaseArray(ref);
  $scope.messages.$loaded().then(function() {
  	// messages have been loaded
  });

  // add new messages to the array
  $scope.addMessage = function() {
    console.log($scope.message);
    console.log($scope.sender);
    if ($scope.message && $scope.sender) {
      $scope.messages.$add({
        message: $scope.message,
        sender: $scope.sender,
        timeStamp: Date.now(),
      });
    }
    /*$scope.messages.$add({
      text: $scope.newMessageText
    });*/
  };
});