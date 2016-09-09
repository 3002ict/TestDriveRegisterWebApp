// Initialize Firebase
var config = {
apiKey: "AIzaSyCzCg5-nEGLkQKDwSrWvMN9aKjL7XecdR8",
authDomain: "testdriveregister-4ef26.firebaseapp.com",
databaseURL: "https://testdriveregister-4ef26.firebaseio.com",
storageBucket: "testdriveregister-4ef26.appspot.com",
};
firebase.initializeApp(config);

// Intialize a "Secondary" App
var secondaryApp = firebase.initializeApp(config, "Secondary");

var app = angular.module('App', ['ngRoute', 'ui.materialize', 'chart.js', 'firebase']);



// Get a reference to the database service
var database = firebase.database();
app.run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    console.log(error);
    if (error === "AUTH_REQUIRED") {
      console.log("Authentication is required.");
      $location.path("/sign_in");
    }
  });
}]);

app.config(["$routeProvider", function($routeProvider){
            $routeProvider
                .when('/sign_in',{
                    templateUrl : 'views/sign_in.html',
                    controller : 'sign_in_controller',
                    resolve: {
                      // controller will not be loaded until $waitForSignIn resolves
                      // Auth refers to our $firebaseAuth wrapper in the factory below
                      "currentAuth": ["Auth", function(Auth) {
                        // $waitForSignIn returns a promise so the resolve waits for it to complete
                        return Auth.$waitForSignIn();
                      }]
                    }
                })
                .when('/',{
                    templateUrl : 'views/main.html',
                    controller : 'main_controller',
                    resolve: {
                      // controller will not be loaded until $requireSignIn resolves
                      // Auth refers to our $firebaseAuth wrapper in the factory below
                      "currentAuth": ["Auth", function(Auth) {
                        // $requireSignIn returns a promise so the resolve waits for it to complete
                        // If the promise is rejected, it will throw a $stateChangeError (see above)
                        return Auth.$requireSignIn();
                      }]
                    }
                })
                .when('/users', {
                  templateUrl: 'views/users.html',
                  controller: 'users_controller',
                  resolve: {
                    // controller will not be loaded until $requireSignIn resolves
                    // Auth refers to our $firebaseAuth wrapper in the factory below
                    "currentAuth": ["Auth", function(Auth) {
                      // $requireSignIn returns a promise so the resolve waits for it to complete
                      // If the promise is rejected, it will throw a $stateChangeError (see above)
                      return Auth.$requireSignIn();
                    }]
                  }
                })
                .when('/settings', {
                  templateUrl: 'views/settings.html',
                  controller: 'settings_controller',
                  resolve: {
                      // controller will not be loaded until $requireSignIn resolves
                      // Auth refers to our $firebaseAuth wrapper in the factory below
                      "currentAuth": ["Auth", function(Auth) {
                        // $requireSignIn returns a promise so the resolve waits for it to complete
                        // If the promise is rejected, it will throw a $stateChangeError (see above)
                        return Auth.$requireSignIn();
                      }]
                    }
                })
                .when('/profile', {
                  templateUrl: 'views/profile.html',
                  controller: 'profile_controller',
                  resolve: {
                      // controller will not be loaded until $requireSignIn resolves
                      // Auth refers to our $firebaseAuth wrapper in the factory below
                      "currentAuth": ["Auth", function(Auth) {
                        // $requireSignIn returns a promise so the resolve waits for it to complete
                        // If the promise is rejected, it will throw a $stateChangeError (see above)
                        return Auth.$requireSignIn();
                      }]
                    }
                })
                .when('/agreement', {
                  templateUrl: 'views/agreement.html',
                  controller: 'agreement_controller'
                });
        }]);
        

app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);

app.controller('sign_in_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseArray", "$firebaseObject",
   function(currentAuth, Auth, $scope, $location, $firebaseArray, $firebaseObject) {
  var auth = Auth;
  
  var user = currentAuth;
  
  //check user signed in 
  if(user){
    console.log("Already signed in");
    $location.path("/");
  }
  
  // sign in with email and password
  $scope.signin = function() {
      $scope.firebaseUser = null;
      $scope.error = null;
      var email = $scope.email;
      var password = $scope.password;
      auth.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
        $scope.firebaseUser = firebaseUser;
        if(firebaseUser){
          console.log("Successfully signed in");
          console.log(firebaseUser);
          var userId = firebaseUser.uid;
          var userRef = firebase.database().ref().child("users").child(userId);
          $scope.user = $firebaseObject(userRef);
          $scope.user.$loaded(function(){
            //check user is admin
            if($scope.user.role != "admin"){
              $location.path("/profile");
              // auth.$signOut();
            }else{
              $location.path("/");
            }
          });
        }else{
          console.log("Failed to sign in");
        }
      }).catch(function(error) {
        $scope.error = error;
      });
  };
}]);

          
app.controller('main_controller', ["currentAuth", "Auth", "$scope", "$location", "$firebaseArray", "$firebaseObject",
   function(currentAuth, Auth, $scope, $location, $firebaseArray, $firebaseObject) {
    var auth = Auth;
    $scope.rate_sum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.rate_num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.preLoad = true;
    
    //get user's info
    var userId = currentAuth.uid;
    var userRef = firebase.database().ref().child("users").child(userId);
    $scope.user = $firebaseObject(userRef);
    
    //get list of test drive data
    getData();

    //update rating data
    function updateRatingData(child){
      $scope.rate_num[$scope.rating_labels.indexOf(child.val().make)] += 1;
      $scope.rate_sum[$scope.rating_labels.indexOf(child.val().make)] += parseFloat(child.val().rate);
      var num = $scope.rating_labels.indexOf(child.val().make);
      $scope.rating_data[0][num] = parseFloat($scope.rate_sum[num])/parseFloat($scope.rate_num[num]);
    }
    
    //function to get 600 test drive data
    function getData(){
      $scope.preLoad = true;
      $scope.error = null;
      var drivesRef = firebase.database().ref().child("drives");
      var drivesQuery = drivesRef.limitToFirst(600);
      $scope.drives = $firebaseArray(drivesQuery);
      $scope.drives.$loaded(function() {
        //data loaded
        $scope.preLoad = false;
        
      }).catch(function(err) {
         $scope.error = err;
         $scope.preLoad = false;
      });
        
        //update rating data when child was added
        drivesRef.on('child_added', function(childSnapshot, prevChildKey) {
            $scope.pi_data[$scope.pi_labels.indexOf(childSnapshot.val().make)] += 1;
            if(childSnapshot.val().rate != null){
                updateRatingData(childSnapshot);
            }
        });
        
        //update rating data when child was changed
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
      if(!firebaseUser){
        $location.path("/sign_in");
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
        Materialize.toast("Invalid Data", 4000);
        getData();
      }
    };
    
    $scope.cancel = getData();
    
}]);


//Controller for users.html
app.controller('users_controller', ["$scope",  "$location", "currentAuth", "Auth", "$firebaseArray", "$firebaseObject",
  function($scope, $location, currentAuth, Auth, $firebaseArray, $firebaseObject) {
    var auth = Auth;
    var userId = currentAuth.uid;
    var userRef = firebase.database().ref().child("users").child(userId);
    $scope.user = $firebaseObject(userRef);
    getData();
    
    //get 1000 user data
    function getData(){
      $scope.preLoad = true;
      $scope.error = null;
      var usersRef = firebase.database().ref().child("users");
      var usersQuery = usersRef.limitToFirst(1000);
      $scope.users = $firebaseArray(usersQuery);
        
      $scope.users.$loaded(function() {
        $scope.preLoad = false;
      }).catch(function(err) {
         $scope.error = err;
         $scope.preLoad = false;
      });
    }
    
    // any time auth state changes, add the user data to scope
    auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
      if(!firebaseUser){
        console.dir("No user is signed in.");
        $location.path("/sign_in");
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
    
    $scope.cancel = getData();
    
    $scope.roles = ["user", "admin"];
    $scope.newUserRoles = ["user", "admin"];
    
    $scope.selectRole = function(role){
      $scope.inputs.role = role;
    };
    
    $scope.newUser = {name: "", email: "", phone: "", role: "user"};
    $scope.selectNewUserRole = function(role){
      $scope.newUser.role = role;
    };
    
    $scope.createUser = function(){
      
      if(isValidNewUser($scope.newUser) && $scope.user.role == "admin"){
        // Create a new user
        secondaryApp.auth().createUserWithEmailAndPassword($scope.newUser.email, $scope.newUser.password)
          .then(function(firebaseUser) {
            var $toastContent = $('<span><i class="material-icons left">done</i>User is successfully created!</span>');
            Materialize.toast($toastContent, 4000);
            var newUser = {
                name: $scope.newUser.name,
                email: $scope.newUser.email,
                phone: $scope.newUser.phone,
                role: $scope.newUser.role
            };
            firebase.database().ref().child("users").child(firebaseUser.uid).set(newUser);
            secondaryApp.auth().signOut();
          }).catch(function(error) {
            Materialize.toast(error, 4000);
          });
      }else{
        Materialize.toast("Invalid user data or you don't have permission to create a new user", 4000)
      }
    };
    
}]);

app.controller('settings_controller', ["$scope", "Auth", "currentAuth", "$firebaseArray", "$firebaseObject",
  function($scope, Auth, currentAuth, $firebaseArray, $firebaseObject) {
    
    //get user's info for side nav
    var auth = Auth;
    var userId = currentAuth.uid;
    var userRef = firebase.database().ref().child("users").child(userId);
    $scope.user = $firebaseObject(userRef);
    $scope.signout = function(){
      auth.$signOut();
    };
    
    
}]);


app.controller('agreement_controller', function(){
  
});

app.controller('profile_controller', function(){
  
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

function isValidNewUser(user){
  if(!user.name){
    return false;
  }
  
  if(!user.email){
    return false;
  }
  
  if(!user.password){
    return false;
  }else if(user.password != user.confirmPassword){
    return false;
  }
  
  return true;
}