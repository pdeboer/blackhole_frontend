angular.module('pplibdataanalyzer_frontend', [
  'pplibdataanalyzer_frontend.home',
  'pplibdataanalyzer_frontend.login',
  'pplibdataanalyzer_frontend.signup',
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
        .controller('AppCtrl', function AppCtrl($scope, store) {

          $scope.loggedin = false;
          if (store.get('jwt')) {
            $scope.loggedin = true;
          } else {
              store.set('jwt', 'eyJhbGciOiJIbWFjU0hBMjU2IiwidHlwIjoiSldUIn0.eyJlbWFpbCI6ImFub25AYW5vbi5jb20iLCJwYXNzd29yZCI6ImFub25Vc2VyIiwiZGF0YSI6MTQ2Njg5OTA1M30.VSDvv71pL--_vSNMDu-_vXNrKyNB77-9JFjvv73vv718fVHvv70K77-95Jm-77-9US8');

          }
          
          

        });