angular.module( 'pplibdataanalyzer_frontend', [
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
.config( function myAppConfig ($urlRouterProvider, jwtInterceptorProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/');

  jwtInterceptorProvider.tokenGetter = function(store) {
    return store.get('jwt');
  }

  $httpProvider.interceptors.push('jwtInterceptor');
    

})
.run(function($rootScope, $state, store, jwtHelper) {
  $rootScope.$on('$stateChangeStart', function(e, to) {
    if (to.data && to.data.requiresLogin) {
      if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
        e.preventDefault();
        $state.go('login');
      }
    }
  });
})
.controller( 'AppCtrl', function AppCtrl ( $scope, $location, store) {
    
    $scope.loggedin = false;
    if(store.get('jwt')) {
     $scope.loggedin = true;   
    }

});