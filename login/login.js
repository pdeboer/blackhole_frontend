angular.module('pplibdataanalyzer_frontend.login', [
  'ui.router',
  'angular-storage'
])
        .config(function ($stateProvider) {
          $stateProvider.state('login', {
            url: '/login',
            controller: 'LoginCtrl',
            templateUrl: 'login/login.html'
          });
        })
        .controller('LoginCtrl', function LoginController($scope, $http, store, $state) {

          $scope.user = {};

          $scope.login = function () {
            $http({
              url: '/users/getJWT',
              method: 'POST',
              data: $scope.user
            }).then(function (response) {
              if (response.data.length === 0) {
                alert("login failed");
                $state.go('login');
              } else {
                store.set('jwt', response.data);
                window.location.reload(false);
                $state.go('search');
              }


            }, function (error) {
              //alert(error.data);
            });
          }

        });
