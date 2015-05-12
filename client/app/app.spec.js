'use strict';

describe('Service: AreasActions', function() {
  var $httpBackend, AreasActions, AreasStore;
  beforeEach(module('testAngularFluxApp'));
  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    AreasActions = $injector.get('AreasActions');
    AreasStore = $injector.get('AreasStore');
  }));
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  it('loadAreas should return areas', function() {
    // the data doesn't matter
    $httpBackend.expectGET('/api/areas').respond(200, '[1,2]');
    AreasActions.loadAreas();
    $httpBackend.flush();
    expect(AreasStore.areas.toJS()).toEqual([1, 2]);
  });
});

