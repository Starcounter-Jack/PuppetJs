import Palindrom from '../../src/palindrom';
import assert from 'assert';
import moxios from 'moxios';
import sinon from 'sinon';
import { Server as MockSocketServer } from 'mock-socket';
import {PalindromError} from '../../src/palindrom-errors';

describe('Palindrom', () => {
  describe('#error responses', () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    context('Network', function() {
      it('should call onConnectionError on HTTP 400 response (non-patch responses)', function(done) {
        const spy = sinon.spy();

        moxios.stubRequest('http://localhost/testURL', {
          status: 400,
          headers: { contentType: 'application/json' },
          responseText: 'Custom message'
        });

        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL'
        });

        palindrom.addEventListener('connection-error', ev => {
          spy(ev.detail);
        });

        /* onConnectionError should be called once now */
        setTimeout(() => {
          assert.equal(spy.callCount, 1);
          done();
        }, 50);
      });

      it('should call onConnectionError on HTTP 599 response', function(done) {
        const spy = sinon.spy();

        moxios.stubRequest('http://localhost/testURL', {
          status: 599,
          headers: { contentType: 'application/json' },
          responseText: 'Custom message'
        });

        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
        });

        palindrom.addEventListener('connection-error', ev => {
          spy(ev.detail);
        });

        /* onConnectionError should be called once now */
        setTimeout(() => {
          assert(spy.calledOnce);
          done();
        }, 5);
      });

      it('should call onConnectionError on HTTP 500 response (patch)', function(
        done
      ) {
        const spy = sinon.spy();

        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
        });

        palindrom.addEventListener('connection-error', ev => {
          spy(ev.detail);
        });

        // let Palindrom issue a request
        setTimeout(() => {
          // respond to it
          let request = moxios.requests.mostRecent();
          request.respondWith({
            status: 200,
            headers: { contentType: 'application/json' },
            responseText: '{"hello": "world"}'
          });
          setTimeout(() => {
            //issue a patch
            palindrom.obj.hello = 'galaxy';

            setTimeout(() => {
              let request = moxios.requests.mostRecent();
              //respond with an error
              request.respondWith({
                status: 500,
                headers: { contentType: 'application/json-patch+json' },
                responseText: `{"op": "replace", "path": "/", value: "Custom message"}`
              });
              setTimeout(() => {
                /* onConnectionError should be called once now */
                assert(spy.calledOnce);
                done();
              }, 5);
            }, 5);
          }, 5);
        }, 5);
      });

      it('should NOT call onConnectionError on HTTP 400 response (patch)', function(
        done
      ) {
        const spy = sinon.spy();

        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL'
        });

        palindrom.addEventListener('connection-error', ev => {
          spy(ev.detail);
        });

        // let Palindrom issue a request
        setTimeout(() => {
          // respond to it
          let request = moxios.requests.mostRecent();
          request.respondWith({
            status: 200,
            headers: { contentType: 'application/json' },
            responseText: '{"hello": "world"}'
          });
          setTimeout(() => {
            //issue a patch
            palindrom.obj.hello = 'galaxy';

            setTimeout(() => {
              let request = moxios.requests.mostRecent();
              //respond with an error
              request.respondWith({
                status: 400,
                headers: { contentType: 'application/json-patch+json' },
                responseText: `{"op": "replace", "path": "/", value: "Custom message"}`
              });
              
              setTimeout(() => {
                /* onConnectionError should NOT be called now */
                assert(spy.notCalled);
                done();
              }, 5);
            }, 5);
          }, 5);
        }, 5);
      });
      it('should call onConnectionError on HTTP 599 response (patch)', function(
        done
      ) {
        const spy = sinon.spy();

        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
        });
        palindrom.addEventListener('connection-error', ev => {
          spy(ev.detail);
        });

        // let Palindrom issue a request
        setTimeout(() => {
          // respond to it
          let request = moxios.requests.mostRecent();
          request.respondWith({
            status: 200,
            headers: { contentType: 'application/json' },
            responseText: '{"hello": "world"}'
          });
          setTimeout(() => {
            //issue a patch
            palindrom.obj.hello = 'galaxy';

            setTimeout(() => {
              let request = moxios.requests.mostRecent();
              //respond with an error
              request.respondWith({
                status: 599,
                responseText: 'error'
              });
              setTimeout(() => {
                /* onConnectionError should be called once now */
                assert(spy.calledOnce);
                done();
              }, 5);
            }, 5);
          }, 5);
        }, 5);
      });
    });
    context('Numbers Validation', function() {
      it('Initial HTTP response: out of range numbers should call onIncomingPatchValidationError with a RangeError', done => {
        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { Location: 'http://localhost/testURL' },
          responseText: `{"value": ${Number.MAX_SAFE_INTEGER + 1}}`
        });
        const spy = sinon.spy();
        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
          onIncomingPatchValidationError: spy
        });

        palindrom.addEventListener('incoming-patch-validation-error', ev => {
          spy(ev.detail);
        });

        setTimeout(() => {
          assert(spy.calledOnce);
          const errorPassed = spy.getCall(0).args[0];
          assert(errorPassed instanceof RangeError);
          assert.equal(
            errorPassed.message,
            `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
              1}, variable path is: /value`
          );
          done();
        }, 10);
      });
      it('Outgoing HTTP patches: out of range numbers should call onOutgoingPatchValidationError with a RangeError', done => {
        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { Location: 'http://localhost/testURL' },
          responseText: `{"val": 1}`
        });

        const spy = sinon.spy();

        const palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
        });

        palindrom.addEventListener('state-reset', ev => {
            ev.detail.val = Number.MAX_SAFE_INTEGER + 1;
        });

        palindrom.addEventListener('outgoing-patch-validation-error', ev => {
          spy(ev.detail);
        });

        setTimeout(() => {
          assert(spy.calledOnce);
          const errorPassed = spy.getCall(0).args[0];
          assert(errorPassed instanceof RangeError);
          assert.equal(
            errorPassed.message,
            `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
              1}, variable path is: /val`
          );
          done();
        }, 15);
      });
      it('Outgoing socket patches: out of range numbers should call onOutgoingPatchValidationError with a RangeError', function(
        done
      ) {
        const server = new MockSocketServer('ws://localhost/testURL');

        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { location: 'http://localhost/testURL' },
          responseText: '{"val": 100}'
        });

        var spy = sinon.spy();

        var palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
          useWebSocket: true
        });

        palindrom.addEventListener('outgoing-patch-validation-error', ev => {
          spy(ev.detail);
        });

        setTimeout(() => {
          palindrom.obj.value = Number.MAX_SAFE_INTEGER + 1;
          // make sure WS is up
          assert.equal(palindrom.network._ws.readyState, 1);
          assert(spy.calledOnce);
          const errorPassed = spy.getCall(0).args[0];
          assert(errorPassed instanceof RangeError);
          assert.equal(
            errorPassed.message,
            `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
              1}, variable path is: /value`
          );
          server.stop(done);
        }, 15);
      });
      it('Incoming socket patches: out of range numbers should call onIncomingPatchValidationError with a RangeError', function(
        done
      ) {
        const server = new MockSocketServer('ws://localhost/testURL');

        moxios.stubRequest('http://localhost/testURL', {
          status: 200,
          headers: { location: 'http://localhost/testURL' },
          responseText: '{"val": 100}'
        });

        var spy = sinon.spy();

        var palindrom = new Palindrom({
          remoteUrl: 'http://localhost/testURL',
          useWebSocket: true,
        });

        palindrom.addEventListener('incoming-patch-validation-error', ev => {
          spy(ev.detail);
        });

        setTimeout(() => {
          server.send(
            `[{"op": "replace", "path": "/val", "value": ${Number.MAX_SAFE_INTEGER +
              1}}]`
          );
          assert(spy.calledOnce);
          const errorPassed = spy.getCall(0).args[0];
          assert(errorPassed instanceof RangeError);
          assert.equal(
            errorPassed.message,
            `A number that is either bigger than Number.MAX_INTEGER_VALUE or smaller than Number.MIN_INTEGER_VALUE has been encountered in a patch, value is: ${Number.MAX_SAFE_INTEGER +
              1}, variable path is: /val`
          );
          server.stop(done);
        }, 15);
      });
    });
  });
});
