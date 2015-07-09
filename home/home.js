angular.module( 'pplibdataanalyzer_frontend.home', [
  'ui.router',
  'angular-storage',
  'angular-jwt'
])
.config(function($stateProvider) {
  $stateProvider.state('home', {
    url: '/',
    controller: 'HomeCtrl',
    templateUrl: 'home/home.html',
    data: {
      requiresLogin: true
    }
  });
})
.controller( 'HomeCtrl', function HomeController( $scope, $http, store, jwtHelper) {

 $scope.myInterval = 5000;
  var slides = $scope.slides = [
    {"image":"img/M51.png", "text":"Help us", "button": "finding new Blackholes"}, 
      {"image":"img/M82.png", "text":"Be the first", "button": "seeing what happens around us"}, 
      {"image":"img/M101.png", "text":"The earth is not enough?", "button": "Explore the universe"}, 
  
  ];

});
