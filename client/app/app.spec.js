'use strict';

describe('Service: AreasActions', function() {
  var mockAreaResource, AreasActions, AreasStore, queryDeferred, $scope, $rootScope;

  beforeEach(module('testAngularFluxApp'));

  beforeEach(function() {
    module(function($provide) {
      mockAreaResource = {};
      $provide.value('AreaResource', mockAreaResource);
    });
  });

  beforeEach(inject(function(_AreasActions_, _AreasStore_, $q, _$rootScope_) {
    mockAreaResource.query = function() {
      queryDeferred = $q.defer();
      queryDeferred.resolve([1, 2]);
      return {
        $promise: queryDeferred.promise
      };
    };
    AreasActions = _AreasActions_;
    AreasStore = _AreasStore_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));


  it('loadAreas should return areas', function() {
    // the data doesn't matter
    spyOn(mockAreaResource, 'query').andCallThrough();
    AreasActions.loadAreas();
    $scope.$listenTo(AreasStore, 'areas.changed', function() {
      expect(AreasStore.areas.toJS()).toEqual([1, 2]);
    });
  });
});

