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
        .controller('LoginCtrl', function LoginController($scope, $http, store, $state, $rootScope) {
            $scope.logged = false;
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
                        // Save jwt & login
                        store.set('jwt', response.data);
                        $scope.logged = true;
                        $rootScope.loggedin = true;
                    }


                }, function (error) {
                    //alert(error.data);
                });
            };

            // Redirect function to search controller
            $scope.redirect = function () {
                $rootScope.loggedin = true;
                $state.go('search', {}, {reload: true});
            };

        });
