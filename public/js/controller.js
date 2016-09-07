// Initialize Firebase
var config = {
apiKey: "AIzaSyCzCg5-nEGLkQKDwSrWvMN9aKjL7XecdR8",
authDomain: "testdriveregister-4ef26.firebaseapp.com",
databaseURL: "https://testdriveregister-4ef26.firebaseio.com",
storageBucket: "testdriveregister-4ef26.appspot.com",
};
firebase.initializeApp(config);

var app = angular.module('App', ['ngRoute', 'ui.materialize', 'chart.js', 'firebase']);



// Get a reference to the database service
var database = firebase.database();

app.config(function($routeProvider, ChartJsProvider){
            $routeProvider
                .when('/sign_in',{
                    templateUrl : 'views/sign_in.html',
                    controller : 'sign_in_controller'
                })
                .when('/',{
                    templateUrl : 'views/main.html',
                    controller : 'main_controller'
                })
                .when('/users', {
                  templateUrl: 'views/users.html',
                  controller: 'users_controller'
                })
                .when('/settings', {
                  templateUrl: 'views/settings.html',
                  controller: 'settings_controller'
                });
        });
        

app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);

app.controller('sign_in_controller', ["$scope", "$firebaseAuth", "$firebaseArray", "$firebaseObject",
   function($scope, $firebaseAuth, $firebaseArray, $firebaseObject) {
  var auth = $firebaseAuth();
  
  var user = firebase.auth().currentUser;
  
  //check user signed in 
  if(user){
    console.log("Already signed in");
    window.location.href = '#/';
  }else{
    console.log("Please sign in");
  }
  
  // sign in with email and password
  $scope.signin = function() {
      $scope.firebaseUser = null;
      $scope.error = null;
      var email = $scope.email;
      var password = $scope.password;
      auth.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
        $scope.firebaseUser = firebaseUser;
        console.log(firebaseUser);
        if(firebaseUser){
          console.log("Successfully signed in");
            window.location.href = '#/';
        }else{
            console.log("Failed to sign in");
        }
      }).catch(function(error) {
        $scope.error = error;
      });
  };
}]);


// function getNumOfMake(make){
//   //Audi | VW |Mazda | Jaguar | Land Rover |Hyundai |Chrysler | Jeep | Dodge | Isuzu|
//   switch(make){
//     case "Audi":
//       return 0;
//       break;
//     case "VW":
//       return 1;
//     case 'Mazda':
//       return 2;
//       break;
//     case 'Jaguar':
//       // code
//       break;
    
    
//   }
// }

          
app.controller('main_controller', ["$scope", "$firebaseAuth", "$firebaseArray", "$firebaseObject",
   function($scope, $firebaseAuth, $firebaseArray, $firebaseObject) {
    var auth = $firebaseAuth();
    $scope.rate_sum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.rate_num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.preLoad = true;

    
    function updateRatingData(child){
      $scope.rate_num[$scope.rating_labels.indexOf(child.val().make)] += 1;
      $scope.rate_sum[$scope.rating_labels.indexOf(child.val().make)] += parseFloat(child.val().rate);
      var num = $scope.rating_labels.indexOf(child.val().make);
      $scope.rating_data[0][num] = parseFloat($scope.rate_sum[num])/parseFloat($scope.rate_num[num]);
    }
    
    
    // any time auth state changes, add the user data to scope
    auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
      if(firebaseUser){
        console.dir("User is signed in");
        var userId = firebase.auth().currentUser.uid;
        var userRef = firebase.database().ref().child("users").child(userId);
        var drivesRef = firebase.database().ref().child("drives");
        var drivesQuery = drivesRef.limitToFirst(300);
        $scope.user = $firebaseObject(userRef);
        console.dir($firebaseArray(drivesQuery));
        $scope.drives = $firebaseArray(drivesQuery);
        $scope.drives.$loaded(function() {
          //show latest data at first page
          $scope.drives= $scope.drives.reverse();
          $scope.preLoad = false;
        });
        
        drivesRef.on('child_added', function(childSnapshot, prevChildKey) {
            $scope.pi_data[$scope.pi_labels.indexOf(childSnapshot.val().make)] += 1;
            if(childSnapshot.val().rate != null){
                updateRatingData(childSnapshot);
            }
        });
        
        drivesRef.on('child_changed', function(childSnapshot, prevChildKey) {
            if(childSnapshot.val().rate != null){
              updateRatingData(childSnapshot);
            }
        });
        
        //check updates
        $scope.drives.$watch(function(event) {
          // console.log(event);
        });
      }else{
        console.dir("No user is signed in.");
        window.location.href = '#/sign_in';
      }
    });
  
  $scope.signout = function(){
    auth.$signOut();
  };
    
    
    //Audi | VW |Mazda | Jaguar | Land Rover |Hyundai |Chrysler | Jeep | Dodge | Isuzu|
    $scope.pi_labels = ["Audi", "VW", "Mazda", "Jaguar", "Land Rover", "Hyundai", "Chrysler", "Jeep", "Dodge", "Isuzu"];
    $scope.pi_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.pi_colors = ['#d50000', '#6200ea', '#0091ea', '#00c853', '#ffd600', '#ff6d00', '#c51162', '#304ffe', '#3e2723', '#64dd17' ];
    
    $scope.pi_options = {
      legend: {
            display: true
        }
    };
    
    $scope.rating_labels = ["Audi", "VW", "Mazda", "Jaguar", "Land Rover", "Hyundai", "Chrysler", "Jeep", "Dodge", "Isuzu"];
    $scope.rating_series = ['Rate'];

    $scope.rating_data = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    $scope.rating_options = {
      scales: {
              yAxes: [{
                  stacked: true,
                  ticks: {
                    min: 0,
                    max: 5,
                    stepSize: 1.0
                }
              }]
          }};
    
    
    $scope.changePage = function(page){
      $scope.min = (page - 1) * 7;
      $scope.max = page * 7;
    };
    
    
    
    $scope.addInputs = function(data){
      $scope.inputs = data;
    };
    
}]);

app.controller('users_controller', ["$scope", "$firebaseAuth", "$firebaseArray", "$firebaseObject",
  function($scope, $firebaseAuth, $firebaseArray, $firebaseObject) {
    var auth = $firebaseAuth();
  // any time auth state changes, add the user data to scope
    auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
      if(firebaseUser){
        console.dir("User is signed in");
        var userId = firebase.auth().currentUser.uid;
        var userRef = firebase.database().ref().child("users").child(userId);
        $scope.user = $firebaseObject(userRef);
        var usersRef = firebase.database().ref().child("users");
        var usersQuery = usersRef.limitToFirst(300);
        $scope.user = $firebaseObject(userRef);
        $scope.users = $firebaseArray(usersQuery);
        
        $scope.users.$loaded(function() {
          //show latest data at first page
          $scope.users= $scope.users.reverse();
          $scope.preLoad = false;
        });
        
      }else{
        console.dir("No user is signed in.");
        window.location.href = '#/sign_in';
      }
    });
    
    $scope.changePage = function(page){
      $scope.min = (page - 1) * 7;
      $scope.max = page * 7;
    };
    
    $scope.addInputs = function(data){
      $scope.inputs = data;
    };
    
    $scope.signout = function(){
      auth.$signOut();
    };
}]);

app.controller('settings_controller', ["$scope", "$firebaseAuth", "$firebaseArray", "$firebaseObject",
  function($scope, $firebaseAuth, $firebaseArray, $firebaseObject) {
    var auth = $firebaseAuth();
  // any time auth state changes, add the user data to scope
    auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
      if(firebaseUser){
        console.dir("User is signed in");
        var userId = firebase.auth().currentUser.uid;
        var userRef = firebase.database().ref().child("users").child(userId);
        $scope.user = $firebaseObject(userRef);
        
        
      }else{
        console.dir("No user is signed in.");
        window.location.href = '#/sign_in';
      }
    });

}]);

