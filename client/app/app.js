'use strict';

angular.module('testAngularFluxApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'flux'
  ])
  .constant('_', window._)
  .run(function ($rootScope) {
     $rootScope._ = window._;
  })
  .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });

angular.module('testAngularFluxApp')
  .config(function($stateProvider, fluxProvider) {
    $stateProvider.state('area', {
      template: '<areas/>',
      url: '/',
    });
    fluxProvider.useCloning(false);
  });



angular.module('testAngularFluxApp')
  .factory('AreasActions', function($resource, flux) {
    var AreaResource = $resource('/api/areas');
    return {
      loadAreas: function() {
        flux.dispatch('loadingAreas');
        var areas = AreaResource.query(function() {
            flux.dispatch('loadedAreasOK', areas);
          }, function(error) {
            flux.dispatch('loadedAreasBAD', error.statusText);
          });
      },
      selectArea: function(area) {
        flux.dispatch('selectArea', area);
      },
      addArea: function (area) {
        flux.dispatch('addArea', area);
      },
      deleteArea: function (area) {
        flux.dispatch('deleteArea', area);
      }
    };
  });

angular
  .module('testAngularFluxApp')
  .store('AreasStore', function(flux) {
    var state = flux.immutable({
      areas: [], //areas.Areas,
      loading: false
    });
    return {
      handlers: {
        'addArea': 'addArea',
        'deleteArea': 'deleteArea',
        'loadingAreas': 'loadingAreas',
        'loadedAreasOK': 'loadedAreasOK'
      },
      addArea: function (area) {
        state = state.areas.push(area);
        this.emit('areas.changed');
      },
      deleteArea: function (area) {
        this.waitFor('GroupsStore', function() {
          var idx = _.findIndex(state.areas, function(_area) {
            return _area.Id === area.Id;
          });
          state = state.areas.splice(idx, 1);
          this.emit('areas.changed');
        });
      },
      loadingAreas: function() {
        state = state.set('loading', true);
        this.emit('areas.loading');
      },
      loadedAreasOK: function(areas) {
        state = state.set('loading', false);
        state = state.areas.splice(0, state.areas.length);
        state = state.areas.concat(areas);
        this.emit('areas.loaded');
      },
      exports: {
        get areas() {
          return state.areas;
        },
        get loading() {
          return state.loading;
        }
      }
    };
  });



angular.module('testAngularFluxApp')
  .directive('areas', function(AreasActions) {
    return {
      controllerAs: 'areaCtrl',
      scope: {},
      template: '<div ng-show="loading" class="well">Loading areas ...</div>' +
      '<ul class="list-group">'+
      '<li class="list-group-item" ng-repeat="area in areas track by area.Id">' +
      '<h3 ng-click=\'selectArea(area)\'>{{area.Title}}</h3>'+
      '<button class="btn" ng-click="deleteArea(area)">Delete</button>' +
      '</li></ul>'+
      '<button class="btn" ng-click="addArea()">Add</button><groups />',

      controller: function($scope, AreasStore) {
        $scope.areas = AreasStore.areas.toJS();
        $scope.loading = AreasStore.loading;

        $scope.selectArea = function(area) {
          AreasActions.selectArea(area);
        };

        $scope.$listenTo(AreasStore, 'areas.changed', function() {
          $scope.areas = AreasStore.areas.toJS();
        });
        $scope.$listenTo(AreasStore, 'areas.loaded', function() {
          $scope.loading = AreasStore.loading;
          $scope.areas = AreasStore.areas.toJS();
        });
        $scope.$listenTo(AreasStore, 'areas.loading', function() {
          $scope.loading = AreasStore.loading;
        });
        $scope.addArea = function () {
          var area = {Id: 'Area' + ($scope.areas.length + 1), Title: 'Area ' + ($scope.areas.length + 1)};
          AreasActions.addArea(area);
        };
        $scope.deleteArea = function (area) {
          AreasActions.deleteArea(area);
        };
        AreasActions.loadAreas();
      }
    };
  });

angular
  .module('testAngularFluxApp')
  .store('GroupsStore', function(flux) {
    var state = flux.immutable({
      area: {}
    });

    return {
      handlers: {
        'selectArea': 'selectArea',
        'deleteArea': 'deleteArea'
      },
      deleteArea: function(area) {
        if (area.Id === state.area.Id) {
          state = state.set('area', {});
          this.emitChange();
        }
      },
      selectArea: function(area) {
        state = state.set('area', area);
        this.emitChange();
      },
      exports: {
        get groups() {
          return state.area.Groups || [];
        }
      }
    };
  });

angular.module('testAngularFluxApp')
  .directive('groups', function() {
    return {
      // controllerAs: 'areaCtrl',
      scope: {},
      template: '<ul><li ng-repeat="group in groups track by group.Id"><h5>{{group.Title}}</h5>' +
        '<ul><li ng-repeat="subarea in group.SubAreas track by $index"><h5>{{subarea.Title}}</h5></li></ul>' +
        '</li></ul>',
      controller: function($scope, GroupsStore) {
        $scope.groups = GroupsStore.groups;
        $scope.$listenTo(GroupsStore, function() {
          $scope.groups = GroupsStore.groups;
        });
      }
    };
  });
