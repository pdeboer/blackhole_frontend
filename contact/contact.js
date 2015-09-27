angular.module( 'pplibdataanalyzer_frontend.contact', [
  'ui.router',
  'angular-storage',
  'angular-jwt'
])
.config(function($stateProvider) {
  $stateProvider.state('contact', {
    url: '/contact',
    controller: 'ContactCtrl',
    templateUrl: 'contact/contact.html',
    data: {
      requiresLogin: false
    }
  });
})
.controller( 'ContactCtrl', function HomeController( $scope, $http, store, jwtHelper) {

  $scope.jwt = store.get('jwt');
  $scope.decodedJwt = $scope.jwt && jwtHelper.decodeToken($scope.jwt);
  
    $scope.submit = function () {
        var msg = {
            name: $scope.name,
            email: $scope.email,
            phone: $scope.phone,
            message: $scope.message,
            uuid: $scope.jwt
        };
        //console.log(angular.toJson(msg));
        $http.post('/contact', angular.toJson(msg)).
                success(function (data, status, headers, config) {
                    alert("Thank you for your submission!")
                }).
                error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }).then(function (response) {
        });


    };


});