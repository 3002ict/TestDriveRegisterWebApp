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
                })
                .when('/agreement', {
                  templateUrl: 'views/agreement.html',
                  controller: 'agreement_controller'
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
    
    function getData(){
      $scope.preLoad = true;
      var drivesRef = firebase.database().ref().child("drives");
      var drivesQuery = drivesRef.limitToFirst(600);
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
    };
    
    
    // any time auth state changes, add the user data to scope
    auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
      if(firebaseUser){
        console.dir("User is signed in");
        var userId = firebase.auth().currentUser.uid;
        var userRef = firebase.database().ref().child("users").child(userId);
        $scope.user = $firebaseObject(userRef);
        
        getData();
        
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
    
    $scope.min = 0;
    $scope.max = 7;
    $scope.changePage = function(page){
      $scope.min = (page - 1) * 7;
      $scope.max = page * 7;
    };
    
    
    
    $scope.addInputs = function(data){
      $scope.inputs = data;
    };
    
    //search filter
    $scope.orderReverse = true;
    $scope.orderBy = "start_drive";
    $scope.types = ["drivername", "license", "phone", "email", "address", "rego", "make", "model", "start_drive", "finish_drive", "username"];

    $scope.selectType = function(type){
      $scope.orderBy = type;
    };
    
    $scope.makes = ["Audi", "VW", "Mazda", "Jaguar", "Land Rover", "Hyundai", "Chrysler", "Jeep", "Dodge", "Isuzu"];

    $scope.selectMake = function(make){
      $scope.inputs.make = make;
    };
    
    $scope.updateDrive = function(){
      if(isValid($scope.inputs)){
        // change data and save it
        var item = $scope.drives.$getRecord($scope.inputs.$id);
        item = $scope.inputs;
        $scope.drives.$save(item).then(function() {
          // data has been saved to our database
        });
      }else{
        alert("Invalid Data");
        getData();
      }
    };
    
    $scope.cancel = function(){
      getData();
    };
    
}]);


//Controller for users.html
app.controller('users_controller', ["$scope", "$firebaseAuth", "$firebaseArray", "$firebaseObject",
  function($scope, $firebaseAuth, $firebaseArray, $firebaseObject) {
    var auth = $firebaseAuth();
    
    function getData(){
      $scope.preLoad = true;
      var usersRef = firebase.database().ref().child("users");
      var usersQuery = usersRef.limitToFirst(1000);
      $scope.users = $firebaseArray(usersQuery);
        
      $scope.users.$loaded(function() {
        //show latest data at first page
        $scope.users= $scope.users.reverse();
        $scope.preLoad = false;
      });
    }
    
  // any time auth state changes, add the user data to scope
    auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
      if(firebaseUser){
        console.dir("User is signed in");
        var userId = firebase.auth().currentUser.uid;
        var userRef = firebase.database().ref().child("users").child(userId);
        $scope.user = $firebaseObject(userRef);
        
        getData();
        
      }else{
        console.dir("No user is signed in.");
        window.location.href = '#/sign_in';
      }
    });
    
    $scope.min = 0;
    $scope.max = 7;
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
    
    //search filter
    $scope.orderReverse = true;
    $scope.orderBy = "name";
    $scope.types = ["name", "email", "phone", "role"];

    $scope.selectType = function(type){
      $scope.orderBy = type;
    };
    
    $scope.updateUser = function(){
      if(isValidUser($scope.inputs)){
        // change data and save it
        var item = $scope.users.$getRecord($scope.inputs.$id);
        item = $scope.inputs;
        $scope.users.$save(item).then(function() {
          // data has been saved to our database
        });
      }else{
        alert("Invalid Data");
        getData();
      }
    };
    
    $scope.cancel = function(){
      getData();
    };
    
    $scope.roles = ["user", "admin"];
    
    $scope.selectRole = function(role){
      $scope.inputs.role = role;
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


app.controller('agreement_controller', function(){
  
});

function isValid(inputs){
  
  if(!inputs.drivername){
    return false;
  }
  
  if(!inputs.licence){
    return false;
  }
  
  if(!inputs.phone){
    return false;
  }
  
  if(!inputs.email){
    return false;
  }
  
  if(!inputs.address){
    return false;
  }
  
  if(!inputs.rego){
    return false;
  }
  
  if(!inputs.model){
    return false;
  }
  
  return true;
}

function isValidUser(inputs){
  if(!inputs.name){
    return false;
  }
  
  return true;
}