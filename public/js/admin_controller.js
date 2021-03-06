var app = angular.module('App');

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
          // console.log(firebaseUser);
          var userId = firebaseUser.uid;
          var userRef = firebase.database().ref().child("users").child(userId);
          $scope.user = $firebaseObject(userRef);
          $scope.user.$loaded(function(){
            if(!$scope.user.enabled){
              
              auth.$signOut();
              $scope.error = {message: "Your account is currently disabled. Please contact administrator."};
            }else if($scope.user.role != "admin"){//check user is admin
            console.log("Not admin");
              $location.path("/profile");
            }else{//general user
              $location.path("/");
            }
          });
        }else{
          console.log("Failed to sign in");
          $scope.error = {message: "Failed to sign in"};
        }
      }).catch(function(error) {
        $scope.error = error;
      });
  };
}]);

app.controller('password_reset_controller', ["$scope","$location", "$firebaseArray", "$firebaseObject",
   function($scope, $location, $firebaseArray, $firebaseObject) {
  
  var auth = firebase.auth();
  $scope.sendEmail = function(){
      $scope.error = null;
      var email = $scope.email;
      auth.sendPasswordResetEmail(email).then(function() {
        // Email sent.
        Materialize.toast("Email was sent.", 4000);
      }, function(error) {
        // An error happened.
        $scope.error = error;
      });
  };
  
  // $scope.linkto = function (path) {
  //   console.log(path);
  //   $location.path(path);
  // };
     
}]);
          
app.controller('main_controller', ["currentAuth", "Auth", "$scope", "$location", "$firebaseArray", "$firebaseObject", "$http",
   function(currentAuth, Auth, $scope, $location, $firebaseArray, $firebaseObject, $http) {
    //get user's info
    var userId = currentAuth.uid;
    var userRef = firebase.database().ref().child("users").child(userId);
    $scope.user = $firebaseObject(userRef);
    //Check role of user
    $scope.user.$loaded(function(){
      if($scope.user.role != "admin"){
        $location.path("/profile");
      }
    });
    
     
    var auth = Auth;
    $scope.rate_sum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.rate_num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.preLoad = true;
    
    
    
    //update rating data
    function updateRatingData(child){
      $scope.rate_num[$scope.rating_labels.indexOf(child.val().make)] += 1;
      $scope.rate_sum[$scope.rating_labels.indexOf(child.val().make)] += parseFloat(child.val().rate);
      var num = $scope.rating_labels.indexOf(child.val().make);
      $scope.rating_data[0][num] = parseFloat($scope.rate_sum[num])/parseFloat($scope.rate_num[num]);
    }
    
    var currentTime = new Date();
    var currentDate = currentTime.getDate();
    var currentMonth = currentTime.getMonth()+1;
    var currentYear = currentTime.getFullYear();
    
    var sixMonth = 6*30;
    $scope.oldDrives = [];
    
    //set data for Charts
    $scope.pi_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.pi_labels = ["Audi", "VW", "Mazda", "Jaguar", "Land Rover", "Hyundai", "Chrysler", "Jeep", "Dodge", "Isuzu"];
    $scope.rating_labels = ["Audi", "VW", "Mazda", "Jaguar", "Land Rover", "Hyundai", "Chrysler", "Jeep", "Dodge", "Isuzu"];
    $scope.rating_series = ['Rate'];
    $scope.rating_data = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    
    //function to get 600 test drive data
    getData();
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
            
            //Check data was created six month ago
            var drive = childSnapshot.val();
            var date = drive.start_drive.split('/')[0];
            var month = drive.start_drive.split('/')[1];
            var year = drive.start_drive.split('/')[2].split(' ')[0];
            var days = (currentDate - parseInt(date)) + (currentMonth - parseInt(month))*30 + (currentYear - parseInt(year))*365;
            if(days >= sixMonth){
              drive.key = childSnapshot.key;
              $scope.oldDrives.push(drive);
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
    
   
    $scope.pi_colors = ['#d50000', '#6200ea', '#0091ea', '#00c853', '#ffd600', '#ff6d00', '#c51162', '#304ffe', '#3e2723', '#64dd17' ];
    
    $scope.pi_options = {
      legend: {
            display: true,
            position: "left",
            fullWidth: true,
            labels: {
              boxWidth: 10,
              fontSize: 12,
              padding: 5
            }
        }
    };
    
    
    
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
    $scope.type = "start_drive";
    $scope.types = ["drivername", "license", "phone", "email", "address", "rego", "make", "model", "start_drive", "finish_drive", "username"];
    $scope.typeChanged = function(type){
       $scope.type = type;
    };
    
    //Custom Order of ng-repeat
    $scope.orderFunction = function(value){
      if($scope.type == "start_drive" && value.start_drive != null){
        
        var day = value.start_drive.split('/')[0];
        var month = value.start_drive.split('/')[1];
        var year = value.start_drive.split('/')[2].split(' ')[0];
        var time = value.start_drive.split('/')[2].split(' ')[1];
        var date = year+month+day;
        return date;
      }else if($scope.type == "finish_drive" && value.finish_drive != null){
        var day = value.finish_drive.split('/')[0];
        var month = value.finish_drive.split('/')[1];
        var year = value.finish_drive.split('/')[2].split(' ')[0];
        var time = value.finish_drive.split('/')[2].split(' ')[1];
        var date = year+month+day;
        return date;
      }else{
        return value[$scope.type];
      }
    };
    $scope.makes = ["Audi", "VW", "Mazda", "Jaguar", "Land Rover", "Hyundai", "Chrysler", "Jeep", "Dodge", "Isuzu"];
    $scope.rates = ["0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];

    
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
    
    $scope.completeDrive = function(){
      //get current time
      var date = new Date();
      
      //formating date
      var dd = ('0' + date.getDate()).slice(-2);
      var MM = ('0' + (date.getMonth() + 1)).slice(-2);
      var yyyy = date.getFullYear();
      var HH = ('0' + date.getHours()).slice(-2);
      var mm = ('0' + date.getMinutes()).slice(-2);
      var ss = ('0' + date.getSeconds()).slice(-2);
      var stringDate = dd + "/" + MM + "/" + yyyy + " " + HH + ":" + mm + ":" + ss;
      
      //add finish time and change status
      $scope.inputs.finish_drive = stringDate;
      $scope.inputs.status = "pending";
      
      //add default value if user didn't select
      if ($scope.inputs.rate == undefined) {
        $scope.inputs.rate = "3.0";
      }
      
      //update test drive data
       if(isValid($scope.inputs)){
        // change data and save it
        var item = $scope.drives.$getRecord($scope.inputs.$id);
        item = $scope.inputs;
        $scope.drives.$save(item).then(function() {
          // data has been saved to our database
          //send a reqeust to mailer
            $http({
              method: 'GET',
              url: 'https://test-drive-mailer.herokuapp.com?key=' + $scope.inputs.$id
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                console.log(response);
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(response);
            });
            
            
            var updates = {};
            updates['/users/' + $scope.inputs.userId + '/resume/'] = null;
            firebase.database().ref().update(updates);
        });
      }else{
        Materialize.toast("Invalid Data", 4000);
        getData();
      }
      
      
                
    }
    
    $scope.cancel = function(){
      getData();
    };
    
    $scope.linkto = function (path) {
      $location.path(path);
    };
    
    //Date picker
    var currentTime = new Date();
    $scope.currentTime = currentTime;
    $scope.month = ['Januar', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $scope.monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $scope.weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $scope.weekdaysLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    // $scope.disable = [false, 1, 7];
    $scope.today = 'Today';
    $scope.clear = 'Clear';
    $scope.close = 'Close';
    // var days = 15;
// $scope.minDate = (new Date($scope.currentTime.getTime() - ( 1000 * 60 * 60 *24 * days ))).toISOString();
// $scope.maxDate = (new Date($scope.currentTime.getTime() + ( 1000 * 60 * 60 *24 * days ))).toISOString();
    $scope.onStart = function () {
        // console.log('onStart');
    };
    $scope.onRender = function () {
        // console.log('onRender');
    };
    $scope.onOpen = function () {
        // console.log('onOpen');
    };
    $scope.onClose = function () {
        // console.log('onClose');
        
    };
    $scope.onSet = function () {
        // console.log('onSet');
        $scope.searchText = $scope.currentTime;
    };
    $scope.onStop = function () {
        // console.log('onStop');
    };
    
    $scope.removeOldData = function(data, index){
      firebase.database().ref().child("drives").child(data.key).update({status: "beingRemoved"});
      $http({
        method: 'GET',
        url: 'https://test-drive-mailer.herokuapp.com/delete?key=' + data.key
      }).then(function successCallback(response) {
          // this callback will be called asynchronously
          // when the response is available
          console.log(response);
      }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          console.log(response);
      });
      Materialize.toast("Email was sent.", 4000);
      $scope.oldDrives.splice(index, 1);
    };
    
    $scope.removeAllOldDrives = function(){
      $scope.oldDrives.forEach(function(item, index){
        firebase.database().ref().child("drives").child(item.key).update({status: "beingRemoved"});
        $http({
          method: 'GET',
          url: 'https://test-drive-mailer.herokuapp.com/delete?key=' + item.key
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(response);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log(response);
        });
      });
      $scope.oldDrives = [];
      Materialize.toast("All data removed", 4000);
    };
    
}]);


//Controller for users.html
app.controller('users_controller', ["$scope",  "$location", "currentAuth", "Auth", "$firebaseArray", "$firebaseObject",
  function($scope, $location, currentAuth, Auth, $firebaseArray, $firebaseObject) {
    var auth = Auth;
    var userId = currentAuth.uid;
    var userRef = firebase.database().ref().child("users").child(userId);
    $scope.user = $firebaseObject(userRef);
    //Check role of user
    $scope.user.$loaded(function(){
      if($scope.user.role != "admin"){
        $location.path("/profile");
      }
    });
    
    
   
    //get 1000 user data
    getData();
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
      console.log($scope.inputs);
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
    $scope.newUserRoles = ["user", "admin"];
    
    
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
                role: $scope.newUser.role,
                enabled: true
            };
            firebase.database().ref().child("users").child(firebaseUser.uid).set(newUser);
            secondaryApp.auth().signOut();
          }).catch(function(error) {
            Materialize.toast(error, 4000);
            secondaryApp.auth().signOut();
          });
      }else{
        Materialize.toast("Invalid user data or you don't have permission to create a new user", 4000)
      }
    };
    
    $scope.linkto = function (path) {
      $location.path(path);
    };
    
    $scope.deleteUser = function(){
      var email = $scope.email;
      var password = $scope.password;
      console.log(email + password);
      secondaryApp.auth().signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
        if(firebaseUser){
          console.log("Successfully signed in");
          firebase.database().ref().child("users").child(firebaseUser.uid).remove();
        
          firebaseUser.delete().then(function() {
            // User deleted.
            console.log("User was deleted.");
          }, function(error) {
            // An error happened.
            console.log(error);
          });
        }else{
          console.log("Failed to sign in");
        }
        secondaryApp.auth().signOut();
      }).catch(function(error) {
        $scope.error = error;
        secondaryApp.auth().signOut();
      });
    };
    
  $scope.enableUser = function(user){
     var index = $scope.users.$indexFor(user.$id);
    $scope.users[index].enabled = !$scope.users[index].enabled;
    $scope.users.$save(index);
   
  };
  
}]);

app.controller('settings_controller', ["$scope", "Auth", "currentAuth", "$firebaseArray", "$firebaseObject", "$location",
  function($scope, Auth, currentAuth, $firebaseArray, $firebaseObject, $location) {
    //get user's info for side nav
    var auth = Auth;
    var userId = currentAuth.uid;
    var userRef = firebase.database().ref().child("users").child(userId);
    $scope.user = $firebaseObject(userRef);
    //Check role of user
    $scope.user.$loaded(function(){
      if($scope.user.role != "admin"){
        $location.path("/profile");
      }
    });
    
    //get storage reference
    var storageRef = storage.ref("agreement/agreement.jpg");
    
    
    $scope.signout = function(){
      auth.$signOut();
    };
    
    $scope.linkto = function (path) {
      $location.path(path);
    };
    
    var firstFile;
    $scope.imageUpload = function(event){
      firstFile = event.target.files[0]; // get the first file uploaded
      var files = event.target.files; //FileList object
       var reader = new FileReader();
       reader.onload = $scope.imageIsLoaded; 
       reader.readAsDataURL(firstFile);
    };
    
    $scope.stepsModel = [];
    
    $scope.imageIsLoaded = function(e){
        $scope.$apply(function() {
            $scope.preview = e.target.result;
        });
    };
    
    $scope.progress = 0;
    $scope.uploadImage = function(){
      
      $scope.progress = 0;
      
      var uploadTask = storageRef.put(firstFile);
      uploadTask.on('state_changed', function progress(snapshot) {
         var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
         $scope.progress = progress;
         $scope.$apply();
          // console.log('Upload is ' + progress + '% done');
      }, function(error) {
        // Handle unsuccessful uploads
        Materialize.toast(error, 4000);
      }, function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        var $toastContent = $('<span><i class="material-icons left">done</i>Image was successfully uploaded!</span>');
        Materialize.toast($toastContent, 4000);
      });
    };
    
}]);




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