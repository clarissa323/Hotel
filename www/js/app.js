// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// the 2nd parameter is an array of 'requires'
angular.module('HotelApp', ['ionic'])

.config(function($stateProvider, $urlRouterProvider){
  // if none of the belowing (above) states are matched, use this as the fallback
  $urlRouterProvider.otherwise("/tab/home");

  $stateProvider
  .state("tabs", {
    url: "/tab",
    templateUrl: "templates/tabs.html",
    abstract: true
  })

  .state("tabs.home", {
    url: "/home",
    //"home-tab" kopplas till <ion-nav-view name="home-tab"></ion-nav-view> i tabs.html filen
    views: {
      "home-tab": {
        templateUrl: "templates/home.html",
        controller: "HomeTabCtrl"
        }
    }
  })

  .state('tabs.book', {
    url: "/book",
    views: {
      'book-tab': {
        templateUrl: "templates/book.html",
        controller: "BookTabCtrl"
      } 
    }
  })

  .state('tabs.dine', {
    url: "/dine",
    views: {
      'dine-tab': {
        templateUrl: "templates/dine.html",
        controller: "DineTabCtrl"
      } 
    }
  })

  //booking confirm is a sub-view to book
  .state('tabs.bookingconfirm', {
    url: "/bookingconfirm",
    views: {
      // visas i book-tab view
      'book-tab': {
        templateUrl: "templates/bookingconfirm.html",
        controller: "BookingConCtrl"
      } 
    }
  }) 

  // food is a sub-view to dine, same controller with dine
  .state('tabs.food', {
    //:ID means can be /users/1, /users/2, /users/3...
    url: "/dine/:fID",
    views: {
      //contact visas i home-tab view
      'dine-tab': {
        templateUrl: "templates/food.html",
        controller: "DineTabCtrl"
      } 
    }
  }) 

}) // avslutar config

.factory('myFactory', function(){
  var myObject = {}; //定义参数对象-数据 "aga":"8665","roomname":"singel", "price":"2800"

  function set(data) {
    myObject = data;
  };

  function get() {
    return myObject;
  };

  return {set: set, get: get};
})

.controller("HomeTabCtrl", function($scope, $ionicSlideBoxDelegate) {
  $scope.go = function(index) {
    $ionicSlideBoxDelegate.slide(index);
  }
})

.controller("BookTabCtrl", function($scope, $http, $ionicSlideBoxDelegate, myFactory) {
  //$scope.nums=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
  
  var tdate = new Date();
  tdate.setDate(tdate.getDate()+1); //Tomorrow's date 
  
  $scope.reservations = {"adate":new Date(), "ddate":tdate, "adults":"1", "child":"0", "gender":"0",};
  $scope.selected={}; //for selecting room information

  var getDateStr=function(pdate){
    var day = ("0" + pdate.getDate()).slice(-2); //格式化日，如果小于9，前面补0
    var month = ("0" + (pdate.getMonth() + 1)).slice(-2); //格式化月，如果小于9，前面补0
    return pdate.getFullYear()+"-"+(month)+"-"+(day);
  }

  $scope.setMinADate=function(){
    return getDateStr(new Date());
  }
  
  $scope.getTotal=function(){
    //get nights
    if($scope.reservations.adate < $scope.reservations.ddate){
      $scope.reservations.nights = parseInt(Math.abs($scope.reservations.ddate.getTime()-$scope.reservations.adate.getTime())/ 1000 / 60 / 60 / 24);
    } else {
      $scope.reservations.nights = 1;
    }

    //get total
    if($scope.selected.room!=null && $scope.reservations.nights!=0 ){
      $scope.reservations.roomid = $scope.selected.room.id;
      $scope.reservations.roomname = $scope.selected.room.name;
      $scope.reservations.price = $scope.selected.room.price;

      $scope.reservations.total = $scope.selected.room.price * $scope.reservations.nights;
    } else {
      $scope.reservations.total = 0;
    }
    return $scope.reservations.total+" kr";
  }

  var tempdata = $scope.reservations; // in case page refresh and reservations is gone

  $scope.sendmsg=myFactory.get(); //for testing

  $scope.checkBook = function(){
    // check if chosen a right room
    var person = parseInt($scope.reservations.adults) + parseInt($scope.reservations.child);
    //check if filled all the inputs
    if($scope.reservations.fname==null || $scope.reservations.lname==null || $scope.reservations.email==null || $scope.reservations.mobile==null || $scope.selected.room==null){
      $scope.errormsg="Finish all the fields marked with *, please!";
      //$scope.msgshow=false;
    }
    else if ($scope.reservations.roomid=="1" && person>1) {
      $scope.errormsg="Cannot book a Single Room for more than 1 person!";
      $scope.msgshow=true;
    }
    else if ($scope.reservations.roomid=="2" && person>2) {
      $scope.errormsg="Cannot book a Double Room for more than 2 person!";
      $scope.msgshow=true;
    }
    else if ($scope.reservations.roomid=="3" && person>5) {
      $scope.errormsg="Cannot book a Family Room for more than 5 person!";
      $scope.msgshow=true;
    }
    else {
      $scope.errormsg="";
      $scope.msgshow=false;

      myFactory.set(tempdata); //save reservations data to factory

      $scope.sendmsg=myFactory.get(); //for testing

      window.location.href="#/tab/bookingconfirm";
    }

  }

  //hit kommer data att skickas och hämtas
  var url = "http://www.yangshan.dx.am/index.php";

  //get rooms data from database
  $http.get(url)
    .then(function(response){
      $scope.request = response;
      //console.log("get url: "+$scope.request);
      //set a variable rooms:
      $scope.rooms = $scope.request.data;
  });
    
  $ionicSlideBoxDelegate.update();
  $scope.goto = function(index) {
    $ionicSlideBoxDelegate.slide(index);
  }

})

.controller("DineTabCtrl", function($scope, $http ,$state, $stateParams) {
  //get food data from json file
  $http.get('../server/food.json')
    .success(function(data){
      $scope.fooddata = data;
      $scope.whichfood = $state.params.fID; //get the item of the list
      console.log($scope.whichfood);
    // $state innehåller all info om en aktuell state
    //console.log("$state : " + $state);
    // $stateParams innehåller enbart info om
    // parametrar t.ex. fID som vi skickar via href Titta i filen list.html under ion-item
    console.log("$stateParams : " + $stateParams.fID + " $scope.whichfood: " +$scope.whichfood);
   })

  //  if($scope.whichfood!=null) {
  //   $scope.food = {"id":1, "name":"et"};
  //   console.log("food: " +$scope.food);
    //$scope.food = $scope.fooddata[(parseInt($scope.whichfoo))];
    


  //  }
  //  $scope.food = {"id":1, "name":"et"};
  // console.log("food: " +$scope.food);
  
  
  //$scope.food the variable used in food.html (parseInt($scope.whichfoo))

})

.controller("BookingConCtrl", function($scope, $http, myFactory) {
  $scope.bookinfo = myFactory.get();

  if($scope.bookinfo.fname==null || $scope.bookinfo.lname==null || $scope.bookinfo.email==null || $scope.bookinfo.mobile==null || $scope.bookinfo.price==null){ 
    $scope.nobookmsg="You havn't finished your reservation. Go back to fill in the empty inputs!";
    $scope.ifshow = false;
  }
  else {
    $scope.roomchosen=$scope.bookinfo.roomname+" - Price: "+$scope.bookinfo.price+" kr";
    $scope.ifshow = true;
  }  

  $scope.backPre = function(){
    window.history.back(-1);
  }

  $scope.submit = function(){
    //hit kommer data att skickas och hämtas
    var url = "http://www.yangshan.dx.am/index.php";

    //data skickas via post
    $http.post(url, $scope.bookinfo)
      .then(function (response){
        $scope.response = response;
        console.log($scope.response);
    }); 

    if($scope.response!=null){
      window.location.href="#/tab/home";
    }
  };


})


.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
