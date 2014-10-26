angular.module('bw', ['ionic'])

.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

        .state('start', {
            url: '/',
            templateUrl: 'templates/start.html'
        })

        .state('explore', {
            url: '/explore',
            abstract: true,
            templateUrl: 'templates/stop-menu.html',
            controller: 'StopListCtrl'
        })

        .state('about', {
            url: '/about',
            templateUrl: 'templates/about.html',
        })

        .state('stop', {
            url: '/stop/:stopId',
            templateUrl: 'templates/stop-detail.html',
            controller: 'StopDetailCtrl'
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/');
})

.controller('MainCtrl', function($scope, $ionicSideMenuDelegate, $ionicModal, $ionicSlideBoxDelegate, $timeout) {
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $ionicModal.fromTemplateUrl('walkthrough.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function() {
        $scope.modal.show();

        $timeout( function() {
            $ionicSlideBoxDelegate.update();
        });
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
})

.controller('StopListCtrl', function($scope, $http) {
    $http.get('stops/stops.json').success(function(data) {
        $scope.stops = data;
    });
})

.controller('StopDetailCtrl', function($scope, $http, $stateParams, $ionicModal) {
    $http.get('stops/stops.json').success(function(data) {
        var current = $stateParams.stopId;
        $scope.stop = data[current - 1];
        $scope.nextStop = data[current];
        $scope.prevStop = data[current - 2];

        if ($scope.stop.id < data.length) {
            $scope.next = '#/stop/' + $scope.nextStop.id;
        } else {
            $scope.next = '#/';
        }

        if ($scope.prevStop) {
            $scope.prev = '#/stop/' + $scope.prevStop.id;
        } else {
            $scope.prev = '#/';
        }
    });
})

.controller('StopAudioCtrl', function($scope, $http, $stateParams) {
    $http.get('stops/stops.json').success(function(data) {
        var current = $stateParams.stopId;
        $scope.stop = data[current - 1];

        $scope.playing = false;
        $scope.audio = document.createElement('audio');
        $scope.audio.src = 'audio/' + $scope.stop.mp3;

        $scope.play = function() {
            $scope.audio.play();
            $scope.playing = true;
        };

        $scope.stop = function() {
            $scope.audio.pause();
            $scope.audio.currentTime = 0;
            $scope.playing = false;
        };

        $scope.audio.addEventListener('ended', function() {
            $scope.$apply(function() {
                $scope.stop();
            });
        });

        $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            $scope.stop();
        });
    });
});
