var app = angular.module('App');

app.controller('agreement_controller', function(){
  
});

app.controller('profile_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject",
   function(currentAuth, Auth, $scope, $location, $firebaseArray, $firebaseObject) {
  var auth = Auth;
  
  var user = currentAuth;
  
  $scope.backButton = "";
  $scope.backAddress = "#/profile";
  $scope.appName = "Profile";
 
 $scope.signout = function(){
      auth.$signOut();
    };
    
}]);

app.controller('driver_details_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject",
   function(currentAuth, Auth, $scope, $location, $firebaseArray, $firebaseObject) {
    var auth = Auth;
  
    var user = currentAuth;
  
    $scope.backButton = "keyboard_backspace";
    $scope.backAddress = "#/profile";
    $scope.appName = "Driver Details";
    
    $scope.makes = ["Audi", "VW", "Mazda", "Jaguar", "Land Rover", "Hyundai", "Chrysler", "Jeep", "Dodge", "Isuzu"];
    $scope.drive = {};
    $scope.drive.make = "Audi";

    $scope.selectMake = function(make){
      $scope.drive.make = make;
    };
    
    $scope.states = ["QLD", "NSW", "VIC", "TAS", "SA", "WA", "NT", "ACT"];
    $scope.currentState = "QLD";
    
    $scope.selectState = function(state){
        $scope.currentState = state;
    }
 
    $scope.signout = function(){
      auth.$signOut();
    };
 
}]);

app.controller('agreement_page_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject",
   function(currentAuth, Auth, $scope, $location, $firebaseArray, $firebaseObject) {
  var auth = Auth;
  
  var user = currentAuth;
  
  //initialize values
  $scope.backButton = "keyboard_backspace";
  $scope.backAddress = "#/driver_details";
  $scope.appName = "Agreement";
  $scope.accept = false;
 
 $scope.signout = function(){
      auth.$signOut();
    };
    
}]);

app.controller('start_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject",
   function(currentAuth, Auth, $scope, $location, $firebaseArray, $firebaseObject) {
  var auth = Auth;
  
  var user = currentAuth;
  
  //initialize values
  $scope.backButton = "keyboard_backspace";
  $scope.backAddress = "#/agreement_page";
  $scope.appName = "Start Drive";
 
 $scope.signout = function(){
      auth.$signOut();
    };
    
}]);

app.controller('drive_controller', ["currentAuth", "Auth", "$scope", "$interval", "$location", "$firebaseObject",
   function(currentAuth, Auth, $scope, $interval, $location, $firebaseArray, $firebaseObject) {
  var auth = Auth;
  
  var user = currentAuth;
  
  //initialize values
  $scope.backButton = "";
  $scope.backAddress = "#/drive";
  $scope.appName = "Test Drive";
  $scope.startTime = new Date();
  var st = $scope.startTime;
  $scope.startTimeString = ("0" + st.getDate()).slice(-2) + "/" + ("0" + (st.getMonth()+1)).slice(-2) + "/" + st.getFullYear() + " " 
    + ("0" + st.getHours()).slice(-2) + ":" + ("0" + st.getMinutes()).slice(-2) + ":" +("0" + st.getSeconds()).slice(-2);
  
  var t = $interval(function() {
      var currentTime = (new Date()).getTime();
      var time = currentTime - $scope.startTime.getTime();
      var sec = Math.floor((time/1000)%60);
      var min = Math.floor((time/(1000*60)%60));
      var hour = Math.floor(time/(1000*60*60));
      $scope.time = ("0" + hour).slice(-2)  + " : " + ("0" + min).slice(-2) + " : " +  ("0" + sec).slice(-2);
    }, 1000);

 
 $scope.signout = function(){
      auth.$signOut();
    };
    
}]);

app.controller('review_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject",
   function(currentAuth, Auth, $scope, $location, $firebaseArray, $firebaseObject) {
  var auth = Auth;
  
  var user = currentAuth;
  
  //initialize values
  $scope.backButton = "";
  $scope.backAddress = "#/review";
  $scope.appName = "Review";
 
 $scope.signout = function(){
      auth.$signOut();
    };
    
    $scope.star = "0.0";
    $scope.slider = {
      value: 5,
      options: {
        stepsArray: [
          {value: '0'}, 
          {value: '0.5'},
          {value: '1'},
          {value: '1.5'},
          {value: '2'},
          {value: '2.5'},
          {value: '3'},
          {value: '3.5'},
          {value: '4'},
          {value: '4.5'},
          {value: '5'},
        ],
        showSelectionBar: true,
        showTicks: true,
        showTicksValues: true,
        onChange: function() {
         // user finished sliding a handle
         $scope.star = $scope.slider.value;
        }
      }
    };
    
    $scope.submitReview = function(){
        auth.$signOut();
    };
   
}]);