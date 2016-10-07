var app = angular.module('App');
//User class
app.value('User', {
    name: null,
    email: null,
    phone: null,
    id: null
})
.factory('UserService', ['User', '$firebaseObject', '$location', function(User, $firebaseObject, $location){
    return {
        setValue: function(key, val){
            User[key] = val;
        },
        getUser: function(){
            return User;
        },
        isEmpty: function(){
            for(var property in User){
                if(User.hasOwnProperty(property)){
                    if(User[property] == null){
                        return true;
                    }
                }
            }
            return false;
        },
        setUser: function(){
            var currentUser = firebase.auth().currentUser;
            var uid = currentUser.uid;
            var userRef = firebase.database().ref().child("users").child(uid);
            var user = $firebaseObject(userRef);
            user.$loaded().then(function() {
                //set vals to User
                User.name = user.name;
                User.id = uid;
                User.email = user.email;
                User.phone = user.phone;
            });
        },
        signOut: function(){
            firebase.auth().signOut().then(function() {
              // Sign-out successful.
              $location.path('/sign_in');
              console.log("Successfully signed out.");
            }, function(error) {
              // An error happened.
              console.log(error);
            });
            
        }
    };
}]);

app.factory('TimeService', function(){
    return {
        startTime: null,
        formatDate: function(date){
            var dd = ('0' + date.getDate()).slice(-2);
            var MM = ('0' + (date.getMonth() + 1)).slice(-2);
            var yyyy = date.getFullYear();
            var HH = ('0' + date.getHours()).slice(-2);
            var mm = ('0' + date.getMinutes()).slice(-2);
            var ss = ('0' + date.getSeconds()).slice(-2);
            return dd + "/" + MM + "/" + yyyy + " " + HH + ":" + mm + ":" + ss;
        }
    };
});

//Driver details class
app.value('Drive', {
    drivername: null,
    licence: null,
    phone: null,
    email: null,
    address: null,
    rego: null,
    make: null,
    model: null,
    start_drive: "00/00/00",
    finish_drive: "00/00/00",
    key: "foobar",
    currentPage: "profile"
})
.factory('DriveService', ['Drive', '$location', function(Drive, $location){
    return {
        setDrive: function(inputs){
            Drive.drivername = inputs.drivername;
            Drive.licence = inputs.licence;
            Drive.phone = inputs.phone;
            Drive.email = inputs.email;
            Drive.address = inputs.address;
            Drive.rego = inputs.rego;
            Drive.make = inputs.make;
            Drive.model = inputs.model;
        },
        setValue: function(key, val){
          Drive[key] = val;  
        },
        getDrive: function(){
          return Drive;  
        },
        isEmpty: function(){
            for(var property in Drive){
              if(Drive.hasOwnProperty(property)){
                //   console.log(property + ":" + Drive[property]);
                  if(Drive[property] == null){
                      console.log("No driver details found");
                      return true;
                  }
              }
            }
            return false;
        },
        movePage: function(path){
            Drive.currentPage = path;
            $location.path(path);
        },
        checkCurrentPage: function(){
            if($location.path() != Drive.currentPage){
                $location.path(Drive.currentPage);
            }
        }
    };
}]);





app.controller('agreement_controller', ["$scope", "loadImage", function($scope, loadImage){
  $scope.agreementImageURL = loadImage;
}]);


///////////////////////
// Profile Controller//
///////////////////////
app.controller('profile_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject", "UserService",
   function(currentAuth, Auth, $scope, $location, $firebaseObject, UserService) {
    //load user info
    UserService.setUser();
    $scope.user = UserService.getUser();
    
    //initalize values
    $scope.backButton = "";
    $scope.back = function(){
        $location.path('/profile');
    };
    $scope.appName = "Profile";
    $scope.signout = UserService.signOut;
    $scope.linkto = function (path) {
      $location.path(path);
    };

}]);

//////////////////////////////
// Driver Details Controller//
//////////////////////////////
app.controller('driver_details_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject", "DriveService", "UserService",
   function(currentAuth, Auth, $scope, $location, $firebaseObject,  DriveService, UserService) {
    
    $scope.drive = {};
    $scope.backButton = "keyboard_backspace";
    $scope.back = function(){
        DriveService.movePage('/profile');
    };
    $scope.appName = "Driver Details";
    $scope.makes = ["Audi", "VW", "Mazda", "Jaguar", "Land Rover", "Hyundai", "Chrysler", "Jeep", "Dodge", "Isuzu"];
    $scope.drive.make = "Audi";
    $scope.states = ["QLD", "NSW", "VIC", "TAS", "SA", "WA", "NT", "ACT"];
    $scope.currentState = "QLD";
    
    //auto fill if user filled before
    if(!DriveService.isEmpty()){
        var drive = DriveService.getDrive();
        console.log(drive);
        $scope.drive.drivername = drive.drivername;
        $scope.drive.licence = drive.licence;
        $scope.drive.phone = drive.phone;
        $scope.drive.email = drive.email;
        $scope.drive.rego = drive.rego;
        $scope.drive.make = drive.make;
        $scope.drive.model = drive.model;
        var address = drive.address.split(', ');
        $scope.street = address[0];
        $scope.suburb = address[1];
        $scope.currentState = address[2].split(' ')[0];
        $scope.postcode = parseInt(address[2].split(' ')[1]);
    }
    
    

    $scope.selectMake = function(make){
      $scope.drive.make = make;
    };
    
    
    
    $scope.selectState = function(state){
        $scope.currentState = state;
    };
 
    $scope.signout = UserService.signOut;
    
    //validate form before moving
    $scope.nextPage = function(){
        $scope.error = "";
        var inputs = $scope.drive;
        if(!inputs.drivername){
            $scope.error = '"Name" is required';
            return;
        }
        if(!inputs.licence){
            $scope.error = '"License" is required';
            return;
        }
        if(!inputs.phone){
            $scope.error = '"Phone Number" is required';
            return;
        }
        if(!inputs.email){
            $scope.error += '"Email" is required or valid';
            return;
        }
        if(!$scope.street || !$scope.suburb || !$scope.currentState || !$scope.postcode){
            $scope.error += '"Mailing Address" is required';
            return;
        }
        if(!inputs.rego){
            $scope.error += '"Rego Number" is required';
            return;
        }
        if(!inputs.make){
            $scope.error += '"Car Make" is required';
            return;
        }
        if(!inputs.model){
            $scope.error += '"Car Model" is required';
            return;
        }
        
        inputs.address = $scope.street + ", " + $scope.suburb + ", " + $scope.currentState + " " + $scope.postcode;
        DriveService.setDrive(inputs);
        DriveService.movePage("/agreement_page");
    };
 
}]);


/////////////////////////
// Agreement Controller//
/////////////////////////
app.controller('agreement_page_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject", "currentDrive", "UserService", "loadImage",
   function(currentAuth, Auth, $scope, $location, $firebaseObject, currentDrive, UserService, loadImage) {
    
    //initialize values
    $scope.backButton = "keyboard_backspace";
    $scope.back = function(){
        currentDrive.movePage('/driver_details');
    };
    $scope.appName = "Agreement";
    $scope.accept = false;
    $scope.signout = UserService.signOut;
    $scope.agreementImageURL = loadImage;
   
  
    //Check box
    $scope.onClickAccept = function(){
        $scope.accept = !$scope.accept;
    };
  
    $scope.onClickContinue = function(){
        if($scope.accept)currentDrive.movePage("/start");
    };
    
}]);


/////////////////////
// Start Controller//
/////////////////////
app.controller('start_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject", "currentDrive", "UserService", "TimeService", "$timeout",
   function(currentAuth, Auth, $scope, $location , $firebaseObject, currentDrive, UserService, TimeService, $timeout) {
  
    //load user data if empty
    if(UserService.isEmpty())UserService.setUser();
  
    //initialize values
    $scope.backButton = "keyboard_backspace";
    $scope.back = function(){
        currentDrive.movePage('/agreement_page');
    };
    $scope.appName = "Start Drive";
    $scope.drive = currentDrive.getDrive();
    $scope.signout = UserService.signOut;
    
    $scope.onClickSubmitDrive = function(){
        $scope.loading = true;
        var currentTime = new Date();
        TimeService.startTime = currentTime;
        var start_drive = TimeService.formatDate(currentTime);
        
        currentDrive.setValue("start_drive", start_drive);
        
        var user = UserService.getUser();
        var drive = currentDrive.getDrive();
        // Get a key for a new post.
        var newDriveKey = firebase.database().ref().child('drives').push().key;
        var driveRef = firebase.database().ref().child('drives').child(newDriveKey);
        
        currentDrive.setValue('key', newDriveKey);
       
        var driveData = {
            drivername: drive.drivername,
            email: drive.email,
            phone: drive.phone,
            licence: drive.licence,
            address: drive.address,
            rego: drive.rego,
            make: drive.make,
            model: drive.model,
            start_drive: start_drive,
            userId: user.id,
            username: user.name,
            status: "started"
        };
        
        //upload data to firebase
        driveRef.set(driveData, function onComplete(error){
            if(error){
                console.log(error);
                $('#startDriveModal').closeModal();
                Materialize.toast(error, 4000);
                return;
            }else{
                console.log("Successfully uploaded.");
            }
            $scope.loading = false;
            $scope.$apply();
            //3 seconds later automatically move to next page
            var t = $timeout(function() {
                //Dynamically close the Materialize modal
                $('#startDriveModal').closeModal();
                currentDrive.movePage('/drive');
            }, 3000);
        });
    };
    
    $scope.onClickStartDrive = function(){
        //Dynamically close the Materialize modal
        $('#startDriveModal').closeModal();
        currentDrive.movePage('/drive');
    };
    
    
}]);


/////////////////////
// Drive Controller//
/////////////////////
app.controller('drive_controller', ["currentAuth", "Auth", "$scope", "$interval", "$location", "$firebaseObject", "UserService", "TimeService", "currentDrive",
   function(currentAuth, Auth, $scope, $interval, $location, $firebaseObject, UserService, TimeService, currentDrive) {
    
    //get start time
    $scope.startTimeString = TimeService.formatDate(TimeService.startTime);
    $scope.startTime = TimeService.startTime;
   
    //initialize values
    $scope.backButton = "";
   $scope.back = function(){
        $location.path('/drive');
    };
    $scope.appName = "Test Drive";
    $scope.signout = UserService.signOut;
  
    var t = $interval(function() {
        var currentTime = (new Date()).getTime();
        var time = currentTime - $scope.startTime.getTime();
        var sec = Math.floor((time/1000)%60);
        var min = Math.floor((time/(1000*60)%60));
        var hour = Math.floor(time/(1000*60*60));
        $scope.time = ("0" + hour).slice(-2)  + " : " + ("0" + min).slice(-2) + " : " +  ("0" + sec).slice(-2);
    }, 1000);
    
    //cancell time when the route is chenged.
    $scope.$on('$destroy', function() {
      $interval.cancel(t);
    });
    
    $scope.onClickFinishDrive = function(){
        var finishTime = new Date();
        var finishTimeString = TimeService.formatDate(finishTime);
        currentDrive.setValue('finish_drive', finishTimeString);
        var drive = currentDrive.getDrive();
        var driveRef = firebase.database().ref().child('drives').child(drive.key);
        driveRef.update({
            finish_drive : finishTimeString,
            status: "inProgress"
        });
        $('#finishModal').closeModal();
        currentDrive.movePage('/review');
    };
}]);



//////////////////////
// Review Controller//
//////////////////////

app.controller('review_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject", "UserService", "currentDrive", "$http",
   function(currentAuth, Auth, $scope, $location, $firebaseObject, UserService, currentDrive, $http) {
  
    //initialize values
    $scope.backButton = "";
    $scope.back = function(){
        $location.path('/review');
    };
    $scope.appName = "Review";
    $scope.signout = UserService.signOut;
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
    var drive = currentDrive.getDrive();
    $scope.start_time = drive.start_drive;
    $scope.finish_time = drive.finish_drive;
    $scope.comments = "";
    
    $scope.onClickSubmitReview = function(){
        $scope.loading = true;
        var driveRef = firebase.database().ref().child('drives').child(drive.key);
        driveRef.update({
            rate : $scope.star,
            comments: $scope.comments,
            status: "pending"   
        }, function onComplete(error){
            if(error){
                console.log(error);
                $('#reviewModal').closeModal();
                Materialize.toast(error, 4000);
            }else{
                console.log("Successfully uploaded.");
                $http({
                  method: 'GET',
                  url: 'https://test-drive-mailer.herokuapp.com?key=' + drive.key
                }).then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    console.log(response);
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log(response);
                });
            }
            $scope.loading = false;
            $scope.$apply();
        });
    };
    
    $scope.onClickComplete = function(){
        
        $('#reviewModal').closeModal();
        UserService.signOut();
    };
}]);