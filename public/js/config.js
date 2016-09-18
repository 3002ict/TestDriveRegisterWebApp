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

var app = angular.module('App', ['ngTouch','ngRoute', 'ui.materialize', 'chart.js', 'firebase', 'ngTouchend', 'rzModule']);



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
                //Admin app
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
                //Web app
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
                .when('/driver_details', {
                  templateUrl: 'views/driver_details.html',
                  controller: 'driver_details_controller',
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
                .when('/agreement_page', {
                  templateUrl: 'views/agreement_page.html',
                  controller: 'agreement_page_controller',
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
                .when('/start', {
                  templateUrl: 'views/start.html',
                  controller: 'start_controller',
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
                .when('/drive', {
                  templateUrl: 'views/drive.html',
                  controller: 'drive_controller',
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
                .when('/review', {
                  templateUrl: 'views/review.html',
                  controller: 'review_controller',
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
                })
                .otherwise({
                    // default page
                    redirectTo: '/sign_in'
                });
        }]);
        

app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);