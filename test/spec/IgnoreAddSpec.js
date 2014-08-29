describe("IgnoreAdd", function () {
  jsonpatch.intervals = [10];

  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    this.puppet.unobserve();
    jasmine.Ajax.uninstall();
  });

  it('should not send add patch to an ignored property', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.puppet = new Puppet('/test', function (myObj) {
      obj = myObj;
    });
    this.puppet.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().response({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    setTimeout(function () {
      obj.hello = 1;
      obj.publicProp = 1;
      obj.$privateProp = 1;

      setTimeout(function () {
        expect(patchSpy.calls.count()).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/hello","value":1},{"op":"add","path":"/publicProp","value":1}]');
        done();
      }, 10);
    }, 10);
  });

  it('should not send replace patch to an ignored property', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.puppet = new Puppet('/test', function (myObj) {
      obj = myObj;
    });
    this.puppet.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().response({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    setTimeout(function () {
      obj.publicProp = 1;
      obj.$privateProp = 1;

      setTimeout(function () {
        expect(patchSpy.calls.count()).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/publicProp","value":1}]');
        obj.publicProp = 2;
        obj.$privateProp = 2;

        setTimeout(function () {
          expect(patchSpy.calls.count()).toBe(3);
          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/publicProp","value":2}]');
          done();
        }, 10);
      }, 10);
    }, 10);
  });

  it('should not send replace patch to an ignored deep object', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.puppet = new Puppet('/test', function (myObj) {
      obj = myObj;
    });
    this.puppet.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().response({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    setTimeout(function () {
      obj.publicProp = ["a", "b", "c"];
      obj.$privateProp = ["a", "b", "c"];

      setTimeout(function () {
        expect(patchSpy.calls.count()).toBe(2);
        expect(patchSpy).toHaveBeenCalledWith('[{"op":"add","path":"/publicProp","value":["a","b","c"]}]');
        obj.publicProp[2] = "cc";
        obj.$privateProp[2] = "cc";

        setTimeout(function () {
          expect(patchSpy.calls.count()).toBe(3);
          expect(patchSpy).toHaveBeenCalledWith('[{"op":"replace","path":"/publicProp/2","value":"cc"}]');
          done();
        }, 10);
      }, 10);
    }, 10);
  });

  it('should not send any patch if all changes were ignored', function (done) {
    var patchSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();
    var obj;
    this.puppet = new Puppet('/test', function (myObj) {
      obj = myObj;
    });
    this.puppet.ignoreAdd = /\/\$.+/;

    jasmine.Ajax.requests.mostRecent().response({
      "status": 200,
      "contentType": 'application/json',
      "responseText": '{"hello": 0}'
    });

    setTimeout(function () {
      expect(patchSpy.calls.count()).toBe(1);
      obj.$privateProp = 1;

      setTimeout(function () {
        expect(patchSpy.calls.count()).toBe(1);
        done();
      }, 10);
    }, 10);
  });
});