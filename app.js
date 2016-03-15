angular.module('pplibdataanalyzer_frontend', [
    'pplibdataanalyzer_frontend.home',
    'pplibdataanalyzer_frontend.login',
    'pplibdataanalyzer_frontend.signup',
    'pplibdataanalyzer_frontend.tsignup',
    'pplibdataanalyzer_frontend.search',
    'pplibdataanalyzer_frontend.contact',
    'pplibdataanalyzer_frontend.about',
    'angular-jwt',
    'angular-storage',
    'ui.bootstrap',
])
        .config(function myAppConfig($urlRouterProvider, jwtInterceptorProvider, $httpProvider) {
            $urlRouterProvider.otherwise('/');

            jwtInterceptorProvider.tokenGetter = function (store) {
                return store.get('jwt');
            }

            $httpProvider.interceptors.push('jwtInterceptor');


        })
        .run(function ($rootScope, $state, store, jwtHelper) {
            $rootScope.$on('$stateChangeStart', function (e, to) {
                if (to.data && to.data.requiresLogin) {
                    if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
                        e.preventDefault();
                        $state.go('login');
                    }
                }
            });
        })
        .controller('AppCtrl', function AppCtrl($scope, store, $state, $http, $rootScope) {
            // Set ip into storage, this for not overusing ipinfo
            if (store.get("ip")) {
            } else {
                $http.get('http://ipinfo.io/json').
                        success(function (data) {
                            store.set("ip", data.ip);
                        });
            }

            // logged in scope (with check for "general jwt")
            $rootScope.loggedin = false;
            if (store.get('jwt') && store.get('jwt') != 'eyJhbGciOiJIbWFjU0hBMjU2IiwidHlwIjoiSldUIn0.eyJlbWFpbCI6ImFub25AYW5vbi5jb20iLCJwYXNzd29yZCI6ImFub25Vc2VyIiwiZGF0YSI6MTQ2Njg5OTA1M30.VSDvv71pL--_vSNMDu-_vXNrKyNB77-9JFjvv73vv718fVHvv70K77-95Jm-77-9US8') {
                $rootScope.loggedin = true;
            } else {
                // No anon autologin anymore
                //store.set('jwt', 'eyJhbGciOiJIbWFjU0hBMjU2IiwidHlwIjoiSldUIn0.eyJlbWFpbCI6ImFub25AYW5vbi5jb20iLCJwYXNzd29yZCI6ImFub25Vc2VyIiwiZGF0YSI6MTQ2Njg5OTA1M30.VSDvv71pL--_vSNMDu-_vXNrKyNB77-9JFjvv73vv718fVHvv70K77-95Jm-77-9US8');

            }

            // logout function
            $scope.logout = function () {
                store.remove("ip");
                store.remove("jwt");
                store.remove("dismiss");
                alert("You are succesfully logged out!");
                $rootScope.loggedin = false;
                $state.go('about', {}, {reload: true});
            };
        });