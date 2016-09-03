var app = angular.module('App', ['ngRoute', 'ui.materialize', 'chart.js']);

// Initialize Firebase
var config = {
apiKey: "AIzaSyCzCg5-nEGLkQKDwSrWvMN9aKjL7XecdR8",
authDomain: "testdriveregister-4ef26.firebaseapp.com",
databaseURL: "https://testdriveregister-4ef26.firebaseio.com",
storageBucket: "testdriveregister-4ef26.appspot.com",
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

var signout = function(){
                  firebase.auth().signOut().then(function() {
                    // Sign-out successful.
                    console.log("Suuccessfully signed out");
                  }, function(error) {
                    // An error happened.
                  });
              };

app.config(function($routeProvider, ChartJsProvider){
            $routeProvider
                .when('/login',{
                    templateUrl : 'views/signin.html',
                    controller : 'login_controller'
                })
                .when('/',{
                    templateUrl : 'views/main.html',
                    controller : 'main_controller'
                })
                .when('/start', {
                  templateUrl: 'views/start.html',
                  controller: 'start_controller'
                })
                .when('/driver_details', {
                  templateUrl: 'views/driver_details.html',
                  controller: 'driver_details_controller'
                });
        });

app.controller('login_controller', function($scope){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        console.log("User is signed in.");
        window.location.href = '#/';
      } else {
        // No user is signed in.
        console.log("No user is signed in.");
      }
    });
    
  $scope.signin = function(){
    var email = $scope.email;
    var password = $scope.password;
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log("Logged in");
                    
                    console.log(error.message);
                  
                });
                
               if(firebase.user){
                    console.log(firebase.user);
                    //$location.path("/");
                }else{
                    console.log("You must login");
                }
  }
  
   
});


          
          
app.controller('main_controller', function($scope){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        console.log("User is signed in.");
        var userId = firebase.auth().currentUser.uid;
        var user = {name: "James Frizelle", email: "jamesfrizelles@testdriveregister.com"};
        $scope.user = user;
        
        var list = [];
        return firebase.database().ref('/drives').once('value').then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
              console.log(childSnapshot.val());
              var child = childSnapshot.val();
              var drive = {icon: "mdi-maps-place", title: "", phone: "", email: "", licence: "", address: ""};
              drive.phone = child.phone;
              drive.email = child.email;
              drive.licence = child.licence;
              drive.address = child.address;
              
  
              drive.title = child.drivername;
              
              
              list.push(drive);
              console.log(list);
          });
          $scope.drives = list;
          $scope.collapsibleElements = list;
          $scope.$apply();
          
        });
      } else {
        // No user is signed in.
        console.log("No user is signed in.");
        window.location.href = '#/login';
      }
    });
    //add sign out function
    $scope.signout = signout;
    
    

    $scope.pi_labels = ["Audi", "BMW", "Toyota"];
    $scope.pi_data = [300, 500, 100];
    $scope.pi_colors = ['#0091ea', '#00c853', '#d50000'];
    
    $scope.pi_options = {
      legend: {
            display: true
        }
    };
    
    $scope.rating_labels = ['Mazda', 'BMW', 'Toyota', 'Audi'];
    $scope.rating_series = ['Rate'];

    $scope.rating_data = [
      [3.6, 4.7, 3.0, 4.5]
    ];
    
    $scope.rating_options = {
      scales: {
              yAxes: [{
                  stacked: true
              }]
          }};
          
    $scope.makes = [
      {name: "Audi", color: "#0091ea"},
      {name: "BMW", color: "#00c853"},
      {name: "Toyota", color: "#d50000"}
    ];
});

app.controller('start_controller', function($scope) {
    $scope.start = function(){
      window.location.href = '#/driver_details';
    }
});

app.controller('driver_details_controller', function($scope) {
    $scope.start = function(){
      //window.location.href = '#/driver_details';
    }
});

