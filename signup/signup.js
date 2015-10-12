angular.module('pplibdataanalyzer_frontend.signup', [
    'ui.router',
    'angular-storage'
])
        .config(function ($stateProvider) {
            $stateProvider.state('signup', {
                url: '/signup',
                controller: 'SignupCtrl',
                templateUrl: 'signup/signup.html'
            });
        })
        .controller('SignupCtrl', function SignupController($scope, $http, store, $state) {

            $scope.user = {};

            $scope.createUser = function () {
                $http({
                    url: '/insertuserregister',
                    method: 'POST',
                    data: $scope.user
                }).then(function (response) {
                    if (response.data != "exists already") {
                        store.set('jwt', response.data);
                        window.location.reload(false);
                        $state.go('search');
                    } else {
                        alert("Creation failed, please send an email to david.pinezich@uzh.ch");
                    }


                }, function (error) {
                    //alert(error.data);
                });
            };

        });
