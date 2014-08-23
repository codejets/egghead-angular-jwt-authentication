(function() {
  'use strict';

  var app = angular.module('app', [], function config($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });

  app.constant('API_URL', 'http://localhost:3000');

  app.controller('MainCtrl', function MainCtrl(UserFactory, RandomUserFactory) {
    'use strict';
    var vm = this;

    // assignment
    vm.login = login;
    vm.getRandomUser = getRandomUser;

    // View Model functions
    function login(username, password) {
      UserFactory.login(username, password).then(function(response) {
        vm.user = response.data.user;
      }, handleError);
    }

    function getRandomUser() {
      RandomUserFactory.getRandomUser().then(function(response) {
        vm.randomUser = response.data;
      }, handleError);
    }


    // UTIL FUNCTIONS
    function handleError(response) {
      alert('Error: ' + response.data);
    }
  });

  app.factory('RandomUserFactory', function RandomUserFactory($http, API_URL) {
    'use strict';
    return {
      getRandomUser: getRandomUser
    };

    function getRandomUser() {
      return $http.get(API_URL + '/random-user');
    }
  });

  app.factory('UserFactory', function LoginFactory($http, API_URL, AuthTokenFactory) {
    'use strict';
    return {
      login: login
    };

    function login(username, password) {
      var loginInfo = {
        username: username,
        password: password
      };
      return $http.post(API_URL + '/login', loginInfo).then(function(response) {
        AuthTokenFactory.setToken(response.data.token);
        return response;
      });
    }
  });

  app.factory('AuthTokenFactory', function AuthTokenFactory($window) {
    'use strict';
    var tokenKey = 'auth-token';
    var store = $window.localStorage;
    return {
      getToken: getToken,
      setToken: setToken
    };

    function getToken() {
      return store.getItem(tokenKey);
    }

    function setToken(token) {
      if (token) {
        store.setItem(tokenKey, token);
      } else {
        store.removeItem(tokenKey);
      }
    }
  });


  app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
    'use strict';
    return {
      request: addAuthToken
    };

    function addAuthToken(config) {
      var token = AuthTokenFactory.getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    }
  });

})();