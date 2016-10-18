var app = angular.module('App');
//User class
app.value('User', {
    name: null,
    email: null,
    phone: null,
    resume: null,
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
        setUser: function(callback){
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
                User.resume = user.resume;
                return callback();
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
        finishTime: null,
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
app.controller('profile_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject", "UserService", "DriveService", "TimeService",
   function(currentAuth, Auth, $scope, $location, $firebaseObject, UserService, DriveService, TimeService) {
    //load user info
    UserService.setUser(function onComplete(){
        if($scope.user.resume != null){
            $('#modal1').openModal();
        }
    });
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
  
  
    $scope.continueDrive = function(){
        
        $('#modal1').closeModal();
        var driveKey = Object.keys($scope.user.resume)[0];
        
        
        if($scope.user.resume[driveKey].status == "started"){
            // split string and create array.
            var arr = $scope.user.resume[driveKey].start_drive.split(/[\s:/]/); 
            //convert dd/MM/yyyy HH:mm:ss into Date object
            var date = new Date(parseInt(arr[2]), parseInt(arr[1]) -1, parseInt(arr[0]), parseInt(arr[3]), parseInt(arr[4]), parseInt(arr[5]), 0);
            TimeService.startTime = date;
            DriveService.setValue('key', driveKey);
            DriveService.setDrive($scope.user.resume);
            DriveService.movePage("/drive");    
        }else if($scope.user.resume[driveKey].status == "inProgress"){
            // split string and create array.
            var arr = $scope.user.resume[driveKey].start_drive.split(/[\s:/]/);
            var arr2 = $scope.user.resume[driveKey].finish_drive.split(/[\s:/]/);
            //convert dd/MM/yyyy HH:mm:ss into Date object
            var startTime = new Date(parseInt(arr[2]), parseInt(arr[1]) -1, parseInt(arr[0]), parseInt(arr[3]), parseInt(arr[4]), parseInt(arr[5]), 0);
            var finishTime =  new Date(parseInt(arr2[2]), parseInt(arr2[1]) -1, parseInt(arr2[0]), parseInt(arr2[3]), parseInt(arr2[4]), parseInt(arr2[5]), 0);
            TimeService.startTime = startTime;
            TimeService.finishTime = finishTime;
            DriveService.setValue('key', driveKey);
            DriveService.setDrive($scope.user.resume);
            DriveService.movePage("/review");   
        }
        
        
    };
    
    //remove uncompleted data
    $scope.removeDrive = function(){
        $('#modal1').closeModal();
        
        var driveKey = Object.keys($scope.user.resume)[0];
        console.log(driveKey);
        var updates = {};
        updates['/drives/' + driveKey] = null;
        updates['/users/' + UserService.getUser().id + '/resume/'] = null;
        firebase.database().ref().update(updates);
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
    $scope.select = {};
    $scope.select.state = "QLD";
  
    //auto fill if user filled before
    if(!DriveService.isEmpty()){
        var drive = DriveService.getDrive();
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
        $scope.select.state = address[2].split(' ')[0];
        $scope.postcode = parseInt(address[2].split(' ')[1]);
    }
    
 
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
        if(!$scope.street || !$scope.suburb || !$scope.select.state || !$scope.postcode){
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
        
        inputs.address = $scope.street + ", " + $scope.suburb + ", " + $scope.select.state + " " + $scope.postcode;
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
    if(UserService.isEmpty())UserService.setUser(function onComplete(){console.log("User set.")});
  
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
        
        var updates = {};
        updates['/drives/' + newDriveKey] = driveData;
        updates['/users/' + UserService.getUser().id + '/resume/' + newDriveKey] = driveData;
      
        //upload data to firebase
        firebase.database().ref().update(updates, function onComplete(error){
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
        TimeService.finishTime = finishTime;
        currentDrive.setValue('finish_drive', finishTimeString);
        var drive = currentDrive.getDrive();
        var updates = {};
        updates['/drives/' + drive.key + '/finish_drive'] = finishTimeString;
        updates['/drives/' + drive.key + '/status'] = "inProgress"; 
        updates['/users/' + UserService.getUser().id + '/resume/' + drive.key + '/finish_drive'] = finishTimeString;
        updates['/users/' + UserService.getUser().id + '/resume/' + drive.key + '/status'] = "inProgress";
        firebase.database().ref().update(updates, function onComplete(error){
            if(error){
                console.log(error);
                $('#finishModal').closeModal();
                Materialize.toast(error, 4000);
                return;
            }else{
                console.log("Successfully uploaded.");
                currentDrive.movePage('/review');
            }
        });
        
    };
}]);



//////////////////////
// Review Controller//
//////////////////////

app.controller('review_controller', ["currentAuth", "Auth", "$scope","$location", "$firebaseObject", "UserService", "currentDrive", "$http", "TimeService",
   function(currentAuth, Auth, $scope, $location, $firebaseObject, UserService, currentDrive, $http, TimeService) {
  
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
    
    $scope.start_time = TimeService.formatDate(TimeService.startTime);
    $scope.finish_time = TimeService.formatDate(TimeService.finishTime);
   
    $scope.comments = "";
    
    $scope.onClickSubmitReview = function(){
        $scope.loading = true;
        var updates = {};
        updates['/drives/' + drive.key + '/rate'] =  $scope.star;
        updates['/drives/' + drive.key + '/comments'] = $scope.comments; 
        updates['/drives/' + drive.key + '/status'] = "pending"; 
        updates['/users/' + UserService.getUser().id + '/resume/'] = null;
        firebase.database().ref().update(updates, function onComplete(error){
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