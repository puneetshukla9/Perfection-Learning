//=======================================================
//=======================================================
describe("Cloud save", function() {

	var CloudSave, PubSub;

	// @FIXME/dg: These would be better tests if a new promise was generated on every save operation.
	// Since we're often detecting nothing occurring (no event emitted), we'd still have the risk of incomplete tests.
	var success, fail;
	var success2, fail2;
	var mockPromise = {
		then: function(s, f) {success = s; fail = f;},
		reject: function() {fail.apply(this, arguments)},
		resolve: function() {success.apply(this, arguments)}
	}
	var mockPromise2 = {
		then: function(s, f) {success2 = s; fail2 = f;},
		reject: function() {fail2.apply(this, arguments)},
		resolve: function() {success2.apply(this, arguments)}
	}

	var mockComm = {
		save: function(){ return mockPromise }
	}
	var mockComm2 = {
		save: function(){ return mockPromise2 }
	}

	var mockCallback = {
		cb: function() {}
	}

	var errorObj = {status: 500};

	//=======================================================
	//=======================================================
	beforeEach(function() {
		module('kb.cloudSave');

		inject(function($injector) {
			CloudSave = $injector.get('CloudSave');
			PubSub = $injector.get('PubSub');
		});
	});

	//=======================================================
	//=======================================================
	beforeEach(function() {
		jasmine.Clock.useMock();

		spyOn(mockComm, 'save').andCallThrough();
		spyOn(mockComm2, 'save').andCallThrough();
		spyOn(mockCallback, 'cb');
		spyOn(PubSub, 'publish');
		CloudSave.register('test', mockComm.save, {notifyDone: mockCallback.cb, warning: 1, error: 3});		// Warn on first error, fail on 3 (for test)
	});

	//=======================================================
	//=======================================================
	describe("add", function() {

		//=======================================================
		//=======================================================
		it("should send a request with a single action", function() {

			CloudSave.add('test', 'id1', {test: 'data1'});

			jasmine.Clock.tick(999);
			expect(mockComm.save).not.toHaveBeenCalled();

			jasmine.Clock.tick(1);
			expect(mockComm.save.callCount).toBe(1);
			expect(mockComm.save).toHaveBeenCalledWith([{test:'data1'}]);
		});

		//=======================================================
		//=======================================================
		it("should remove redundant requests before transmission", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});
			CloudSave.add('test', 'id1', {test: 'data2'});

			jasmine.Clock.tick(1000);
			expect(mockComm.save.callCount).toBe(1);
			expect(mockComm.save).toHaveBeenCalledWith([{test:'data2'}]);
		});

		//=======================================================
		//=======================================================
		it("should transmit multiple non-redundant requests in a single transmission", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});
			CloudSave.add('test', 'id2', {test: 'data2'});

			jasmine.Clock.tick(1000);
			expect(mockComm.save.callCount).toBe(1);
			expect(mockComm.save).toHaveBeenCalledWith([{test:'data1'}, {test:'data2'}]);
		});

		//=======================================================
		// This also tests delay between transmissions
		//=======================================================
		it("should queue up and send requests added during transmission", function() {
			CloudSave.add('test', 'id1', {a: 'a'});
			jasmine.Clock.tick(1000);
			CloudSave.add('test', 'id2', {b: 'b'});

			expect(mockComm.save.callCount).toBe(1);
			expect(mockComm.save).toHaveBeenCalledWith([{a:'a'}]);

			mockPromise.resolve();
			jasmine.Clock.tick(1000);

			expect(mockComm.save.callCount).toBe(2);
			expect(mockComm.save).toHaveBeenCalledWith([{b:'b'}]);
		});

		//=======================================================
		//=======================================================
		it("should resend on transmission failure", function() {
			CloudSave.add('test', 'id1', {a: 'a'});
			jasmine.Clock.tick(1000);

			mockPromise.reject(errorObj);
			jasmine.Clock.tick(1000);
			expect(mockComm.save.callCount).toBe(2);
			expect(mockComm.save.mostRecentCall.args).toEqual([[{a:'a'}]]);
		});

		//=======================================================
		//=======================================================
		it("should add any extra non-redundant requests on retransmission due to failure", function() {
			CloudSave.add('test', 'id1', {a: 'a'});
			jasmine.Clock.tick(1000);
			CloudSave.add('test', 'id2', {b: 'b'});

			mockPromise.reject(errorObj);
			jasmine.Clock.tick(1000);
			expect(mockComm.save.callCount).toBe(2);
			expect(mockComm.save.mostRecentCall.args).toEqual([[{a:'a'},{b:'b'}]]);
		});

		//=======================================================
		//=======================================================
		it("should remove new redundant requests on retransmission due to failure", function() {
			CloudSave.add('test', 'id1', {a: 'a'});
			jasmine.Clock.tick(1000);
			CloudSave.add('test', 'id1', {b: 'b'});

			mockPromise.reject(errorObj);
			jasmine.Clock.tick(1000);
			expect(mockComm.save.callCount).toBe(2);
			expect(mockComm.save.mostRecentCall.args).toEqual([[{b:'b'}]]);
		});
	});

	//=======================================================
	//=======================================================
	describe("isIdle", function() {

		//=======================================================
		//=======================================================
		it("should report Idle before any requests", function() {
			expect(CloudSave.isIdle()).toBe(true);
		});

		//=======================================================
		//=======================================================
		it("should report Idle after requests complete", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});
			jasmine.Clock.tick(1000);
			mockPromise.resolve();

			expect(CloudSave.isIdle()).toBe(true);
		});

		//=======================================================
		//=======================================================
		it("should report Not Idle during transmissions", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});
			jasmine.Clock.tick(1000);

			expect(CloudSave.isIdle()).toBe(false);
		});

		//=======================================================
		//=======================================================
		it("should report Not Idle while waiting for transmission", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});

			expect(CloudSave.isIdle()).toBe(false);
		});

		//=======================================================
		//=======================================================
		it("should report Not Idle if any channel is currently busy", function() {
			CloudSave.register('00', mockComm2.save);

			expect(CloudSave.isIdle()).toBe(true);

			CloudSave.add('test', 'id1', {test: 'data1'});
			expect(CloudSave.isIdle()).toBe(false);

			CloudSave.add('00', 'id2', {test: 'data1'});
			expect(CloudSave.isIdle()).toBe(false);

			jasmine.Clock.tick(1000);
			expect(CloudSave.isIdle()).toBe(false);

			mockPromise.resolve();
			expect(CloudSave.isIdle()).toBe(false);

			mockPromise2.resolve();
			expect(CloudSave.isIdle()).toBe(true);
		});

	});	// isIdle

	//=======================================================
	//=======================================================
	xdescribe("isSaving", function() {

		//=======================================================
		//=======================================================
		it("should report Not Saving before any requests", function() {
			expect(CloudSave.isSaving('test')).toBe(false);
		});

		//=======================================================
		//=======================================================
		it("should report Not Saving while waiting for transmission", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});

			expect(CloudSave.isSaving('test')).toBe(false);
		});

		//=======================================================
		//=======================================================
		it("should report Saving during transmission", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});

			jasmine.Clock.tick(999);
			expect(CloudSave.isSaving('test')).toBe(false);

			jasmine.Clock.tick(1);
			expect(CloudSave.isSaving('test')).toBe(true);
		});

		//=======================================================
		//=======================================================
		it("should report Not Saving after transmission", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});
			jasmine.Clock.tick(1000);
			mockPromise.resolve();

			expect(CloudSave.isSaving('test')).toBe(false);
		});

		//=======================================================
		//=======================================================
		it("should report Saving during retransmission due to failure", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});
			jasmine.Clock.tick(1000);
			mockPromise.reject(errorObj);

			expect(CloudSave.isSaving('test')).toBe(true);
		});

	});	// isSaving

	//=======================================================
	//=======================================================
	describe("external notification", function() {

		//=======================================================
		//=======================================================
		it("should perform a callback on successful saves", function() {
			CloudSave.add('test', 'id1', {test: 'data1'});
			jasmine.Clock.tick(1000);

			expect(mockCallback.cb).not.toHaveBeenCalled();
			mockPromise.resolve();
			expect(mockCallback.cb).toHaveBeenCalled();
		});

		//=======================================================
		//=======================================================
		it("should emit save start and completion events", function() {

			expect(PubSub.publish).not.toHaveBeenCalled();
			CloudSave.add('test', 'id1', {test: 'data1'});

			// Queued, but not started
			jasmine.Clock.tick(999);
			expect(PubSub.publish).not.toHaveBeenCalled();

			// Started
			jasmine.Clock.tick(1);
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);

			// Saved
			mockPromise.resolve();
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saved']);
		});

		//=======================================================
		//=======================================================
		it("should emit a warning after multiple failures", function() {
			expect(PubSub.publish).not.toHaveBeenCalled();
			CloudSave.add('test', 'id1', {test: 'data1'});
			jasmine.Clock.tick(1000);
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);

			// Fail once (assumes warning on first failure)
			mockPromise.reject(errorObj);
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
		});

		//=======================================================
		//=======================================================
		it("should emit a failure notification after enough failures", function() {
			expect(PubSub.publish).not.toHaveBeenCalled();
			CloudSave.add('test', 'id1', {test: 'data1'});
			jasmine.Clock.tick(1000);
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);

			// Fail once (assumes warning on first failure)
			mockPromise.reject(errorObj);
			jasmine.Clock.tick(1000);
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);

			// Fail 3 times for error
			mockPromise.reject(errorObj);
			jasmine.Clock.tick(1000);
			mockPromise.reject(errorObj);
			jasmine.Clock.tick(1000);
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);

			// Verify no more saves after failure
			mockPromise.reject(errorObj);		// A few more rejections, just to be sure
			jasmine.Clock.tick(1000);
			mockPromise.reject(errorObj);
			jasmine.Clock.tick(1000);
			mockPromise.reject(errorObj);
			expect(PubSub.publish.callCount).toBe(3);
			expect(mockComm.save.callCount).toBe(3);
		});

		//=======================================================
		//=======================================================
		it("shouldn't emit a warning if the ignoreErrors flag is set", function() {
			CloudSave.register('test2', mockComm2.save, {notifyDone: mockCallback.cb, warning: 1, error: 3, ignoreErrors: true});		// Warn on first error, fail on 3 (for test)

			expect(PubSub.publish).not.toHaveBeenCalled();
			CloudSave.add('test2', 'id1', {test: 'data1'});
			jasmine.Clock.tick(1000);
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);

			// Fail once (assumes warning on first failure)
			mockPromise.reject(errorObj);
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);
		});
	});

	//=======================================================
	//=======================================================
	describe("error recovery", function() {

		//=======================================================
		//=======================================================
		it("should continue to queue up data during recovery", function() {
			CloudSave.add('test', 'id1', {test1: 'data1'});

			// Fail once (assumes warning on first failure)
			jasmine.Clock.tick(1000);
			mockPromise.reject(errorObj);
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);

			// Once more for good measure
			jasmine.Clock.tick(1000);
			mockPromise.reject(errorObj);

			// Add more data
			CloudSave.add('test', 'id2', {test2: 'data2'});

			expect(mockComm.save.mostRecentCall.args).toEqual([[{test1:'data1'}]]);
			jasmine.Clock.tick(1000);
			expect(mockComm.save.mostRecentCall.args).toEqual([[{test1:'data1'},{test2:'data2'}]]);

			// Throw in a recovery for good measure (this should be a separate test)
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
			mockPromise.resolve();
			expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saved']);
		});
	});

	//=======================================================
	//=======================================================
	describe("multiple handlers", function() {

		//=======================================================
		//=======================================================
		it("should throw an error when attempting to register two handlers with the same name", function() {
			expect(function(){CloudSave.register('test', mockComm.save)}).toThrow();
		});

		//=======================================================
		//=======================================================
		it("should throw an error when attempting to save to an unknown handler", function() {
			expect(function(){CloudSave.add('DoesntExist', 'id1', {test1: 'data1'})}).toThrow();
		});

		//=======================================================
		//=======================================================
		it("should allow multiple handlers to be registered", function() {
			CloudSave.register('handler2', mockComm2.save);
			CloudSave.register('handler3', mockComm.save);

			expect(function(){CloudSave.add('handler2', 'aa', {test1: 'data1'})}).not.toThrow();
			expect(function(){CloudSave.add('handler3', 'bb', {test1: 'data1'})}).not.toThrow();
		});

		//=======================================================
		//=======================================================
		it("should save to the correct handler", function() {
			CloudSave.register('H2', mockComm2.save);

			CloudSave.add('H2', 'h2', {data: 'h2'});

			jasmine.Clock.tick(1000);
			expect(mockComm.save.callCount).toBe(0);

			expect(mockComm2.save.callCount).toBe(1);
			expect(mockComm2.save).toHaveBeenCalledWith([{data:'h2'}]);
		});

		//=======================================================
		//=======================================================
		it("should allow concurrent save attempts to different handlers", function() {
			CloudSave.register('H1', mockComm.save);
			CloudSave.register('H2', mockComm2.save);

			CloudSave.add('H1', 'h1', {data: 'h1'});
			jasmine.Clock.tick(500);
			expect(mockComm.save).not.toHaveBeenCalled();
			expect(mockComm2.save).not.toHaveBeenCalled();

			CloudSave.add('H2', 'h2', {data: 'h2'});

			jasmine.Clock.tick(500);
			expect(mockComm.save.callCount).toBe(1);
			expect(mockComm.save).toHaveBeenCalledWith([{data:'h1'}]);
			expect(mockComm2.save).not.toHaveBeenCalled();

			jasmine.Clock.tick(500);
			expect(mockComm2.save.callCount).toBe(1);
			expect(mockComm2.save).toHaveBeenCalledWith([{data:'h2'}]);
		});
	});

	//=======================================================
	// Tests for the status manager that receives multiple input
	// events and maps them to a global status (which generates external events)
	//=======================================================
	describe("event management", function() {

		//=======================================================
		//=======================================================
		describe("upgrades and downgrades", function() {

			//=======================================================
			//=======================================================
			it("should emit higher priority events", function() {
				expect(PubSub.publish).not.toHaveBeenCalled();

				CloudSave.add('test', '1', {data: '1'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);

				mockPromise.resolve();
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saved']);
			});

			//=======================================================
			//=======================================================
			it("shouldn't emit same level events", function() {
				expect(PubSub.publish).not.toHaveBeenCalled();

				CloudSave.add('test', '1', {data: '1'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('test', '2', {data: '2'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});

			//=======================================================
			//=======================================================
			it("should emit lower level events on a single channel", function() {
				CloudSave.add('test', '1', {data: '1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);

				jasmine.Clock.tick(1000);
				mockPromise.resolve();
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saved']);
			});

		});

		//=======================================================
		//=======================================================
		describe("Not Logged In", function() {

			//=======================================================
			//=======================================================
			it("should emit when receiving a 403", function() {
				expect(PubSub.publish).not.toHaveBeenCalled();

				CloudSave.add('test', '1', {data: '1'});
				jasmine.Clock.tick(1000);

				mockPromise.reject({status:403});
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:notLoggedIn']);
			});

			//=======================================================
			//=======================================================
			it("should ignore all other events once a NotLoggedIn event occurs", function() {
				CloudSave.register('H1', mockComm2.save);
				CloudSave.register('H2', mockComm2.save);
				CloudSave.register('H3', mockComm2.save);
				expect(PubSub.publish).not.toHaveBeenCalled();

				CloudSave.add('test', '1', {data: '1'});
				jasmine.Clock.tick(500);
				CloudSave.add('H1', 'h1', {data: 'h2'});
				jasmine.Clock.tick(500);
				mockPromise.reject({status:403});
				var ccnt = PubSub.publish.callCount;
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:notLoggedIn']);

				jasmine.Clock.tick(500);
				mockPromise.reject({status:403});
				expect(PubSub.publish.callCount).toEqual(ccnt);

				CloudSave.add('H2', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.reject({status:500});
				expect(PubSub.publish.callCount).toEqual(ccnt);

				CloudSave.add('H3', 'h3', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.resolve();
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});
		});

		//=======================================================
		//=======================================================
		describe("Saving", function() {

			//=======================================================
			//=======================================================
			it("should handle Saving events in the Idle state", function() {
				expect(PubSub.publish).not.toHaveBeenCalled();
				CloudSave.add('test', '1', {data: '1'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);
			});

			//=======================================================
			//=======================================================
			it("should handle Saving events in the Saving state", function() {
				CloudSave.register('HA', mockComm.save);
				CloudSave.register('HB', mockComm2.save);

				CloudSave.add('HA', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('HB', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});

			//=======================================================
			//=======================================================
			it("should handle Saving events in the Warning state", function() {
				CloudSave.register('HA', mockComm.save);
				CloudSave.register('HB', mockComm2.save);

				CloudSave.add('HA', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('HB', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});

			//=======================================================
			//=======================================================
			it("should handle Saving events in the Error state", function() {
				CloudSave.register('other', mockComm2.save);

				// Fail 3 times for error
				CloudSave.add('test', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('other', 'ho', {data: 'ho'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});

			//=======================================================
			// This was already tested in Not Logged In -- Don't bother
			//=======================================================
			xit("should handle Saving events in the Not Logged In state", function() {
			});

		});

		//=======================================================
		//=======================================================
		describe("Warning", function() {

			//=======================================================
			//=======================================================
			it("should handle Warning events in the Saving state", function() {
				CloudSave.register('HA', mockComm.save);
				CloudSave.register('HB', mockComm2.save);

				CloudSave.add('HA', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('HB', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
				expect(PubSub.publish.callCount).toEqual(ccnt+1);
			});

			//=======================================================
			//=======================================================
			it("should handle Warning events in the Warning state", function() {
				CloudSave.register('HA', mockComm.save);
				CloudSave.register('HB', mockComm2.save);

				CloudSave.add('HA', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('HB', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});

			//=======================================================
			//=======================================================
			it("should handle Warning events in the Error state", function() {
				CloudSave.register('other', mockComm2.save);

				// Fail 3 times for error
				CloudSave.add('test', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('other', 'ho', {data: 'ho'});
				jasmine.Clock.tick(1000);
				mockPromise2.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});

			//=======================================================
			// This was already tested in Not Logged In -- Don't bother
			//=======================================================
			xit("should handle Warning events in the Not Logged In state", function() {

			});

		});

		//=======================================================
		//=======================================================
		describe("Error", function() {

			//=======================================================
			//=======================================================
			it("should handle Error events in the Saving state", function() {
				CloudSave.register('HA', mockComm.save);
				CloudSave.register('HB', mockComm2.save, {notifyDone: mockCallback.cb, warning: 1, error: 2});

				CloudSave.add('HA', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('HB', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise2.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				expect(PubSub.publish.callCount).toEqual(ccnt+2);	// warning + error
			});

			//=======================================================
			//=======================================================
			it("should handle Error events in the Warning state", function() {
				CloudSave.register('HA', mockComm.save);
				CloudSave.register('HB', mockComm2.save, {notifyDone: mockCallback.cb, warning: 1, error: 2});

				CloudSave.add('HA', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('HB', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise2.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				expect(PubSub.publish.callCount).toEqual(ccnt+1);	// error
			});

			//=======================================================
			//=======================================================
			it("should handle Error events in the Error state", function() {
				CloudSave.register('HA', mockComm.save, {notifyDone: mockCallback.cb, warning: 1, error: 2});
				CloudSave.register('HB', mockComm2.save, {notifyDone: mockCallback.cb, warning: 1, error: 2});

				CloudSave.add('HA', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('HB', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise2.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				expect(PubSub.publish.callCount).toEqual(ccnt);

			});

			//=======================================================
			// This was already tested in Not Logged In -- Don't bother
			//=======================================================
			xit("should handle Error events in the Not Logged In state", function() {

			});

		});

		//=======================================================
		//=======================================================
		describe("Saved", function() {

			//=======================================================
			//=======================================================
			it("should handle Saved events in the Saving state", function() {
				CloudSave.register('00', mockComm2.save);

				CloudSave.add('test', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('00', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.resolve();
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saving']);
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});

			//=======================================================
			//=======================================================
			it("should handle Saved events in the Warning state", function() {
				CloudSave.register('00', mockComm2.save);

				CloudSave.add('test', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('00', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.resolve();
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});

			//=======================================================
			//=======================================================
			it("should handle Saved events in the Error state", function() {
				CloudSave.register('00', mockComm2.save);

				CloudSave.add('test', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				var ccnt = PubSub.publish.callCount;

				CloudSave.add('00', 'h2', {data: 'h2'});
				jasmine.Clock.tick(1000);
				mockPromise2.resolve();
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:failed']);
				expect(PubSub.publish.callCount).toEqual(ccnt);
			});

			//=======================================================
			// This was already tested in Not Logged In -- Don't bother
			//=======================================================
			xit("should handle Saved events in the Not Logged In state", function() {

			});

		});
	});

	//=======================================================
	//=======================================================
	describe("Flush requests", function() {

		//=======================================================
		//=======================================================
		describe("success", function() {

			//=======================================================
			//=======================================================
			it("should immediately save all requests for a single handler", function() {
				CloudSave.add('test', 'h1', {data: 'h1'});

				expect(mockComm.save).not.toHaveBeenCalled();

				CloudSave.flush();

				expect(mockComm.save.callCount).toBe(1);
				expect(mockComm.save).toHaveBeenCalledWith([{data:'h1'}]);
			});

			//=======================================================
			//=======================================================
			it("should immediately save all requests for multiple handlers", function() {
				CloudSave.register('00', mockComm2.save);

				CloudSave.add('test', 'h1', {data: 'h1'});
				jasmine.Clock.tick(500);
				CloudSave.add('00', 'h2', {data: 'h2'});

				expect(mockComm.save).not.toHaveBeenCalled();
				expect(mockComm2.save).not.toHaveBeenCalled();

				CloudSave.flush();
				expect(mockComm.save).toHaveBeenCalledWith([{data:'h1'}]);
				expect(mockComm2.save).toHaveBeenCalledWith([{data:'h2'}]);
			});

			//=======================================================
			//=======================================================
			it("should emit a single Saved event when the final item completes", function() {
				CloudSave.register('00', mockComm2.save);

				CloudSave.add('test', 'h1', {data: 'h1'});
				CloudSave.add('00', 'h2', {data: 'h2'});
				CloudSave.flush();
				expect(PubSub.publish).not.toHaveBeenCalled();

				mockPromise2.resolve();
				expect(PubSub.publish).not.toHaveBeenCalled();

				mockPromise.resolve();
				expect(PubSub.publish.callCount).toEqual(1);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saved']);
			});

			//=======================================================
			//=======================================================
			it("should immediately save requests that are delayed in error recovery mode", function() {
				CloudSave.add('test', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				mockPromise.reject(errorObj);

				expect(mockComm.save.callCount).toBe(1);
				expect(PubSub.publish.callCount).toEqual(2);	// saving, warning
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);

				CloudSave.flush();
				expect(mockComm.save.callCount).toBe(2);
				expect(PubSub.publish.callCount).toEqual(2);	// saving, warning
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);

				mockPromise.resolve();
				expect(PubSub.publish.callCount).toEqual(3);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:saved']);
			});

			//=======================================================
			//=======================================================
			it("should not resave data in the process of being saved", function() {
				CloudSave.add('test', 'h1', {data: 'h1'});
				jasmine.Clock.tick(1000);
				expect(mockComm.save.callCount).toBe(1);

				CloudSave.flush();
				expect(mockComm.save.callCount).toBe(1);
			});
		});

		//=======================================================
		//=======================================================
		describe("errors", function() {

			//=======================================================
			//=======================================================
			it("should only try one final time to save after flushing", function() {
				CloudSave.add('test', 'h1', {data: 'h1'});
				CloudSave.flush();
				expect(mockComm.save.callCount).toBe(1);

				mockPromise.reject(errorObj);
				expect(mockComm.save.callCount).toBe(1);
				expect(PubSub.publish.callCount).toEqual(1);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);

				jasmine.Clock.tick(1000);
				expect(mockComm.save.callCount).toBe(1);
				expect(PubSub.publish.callCount).toEqual(1);
			});

			//=======================================================
			//=======================================================
			it("should emit a single error notification when any error occurs", function() {
				CloudSave.register('00', mockComm2.save);

				CloudSave.add('test', 'h1', {data: 'h1'});
				CloudSave.add('00', 'h2', {data: 'h2'});
				CloudSave.flush();
				expect(PubSub.publish).not.toHaveBeenCalled();

				mockPromise.reject(errorObj);
				expect(PubSub.publish.callCount).toEqual(1);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);

				mockPromise2.reject(errorObj);
				expect(PubSub.publish.callCount).toEqual(1);
				expect(PubSub.publish.mostRecentCall.args).toEqual(['cloudSave:warning']);
			});

			//=======================================================
			//=======================================================
			it("should maintain a list of unsaved handlers and have the ability to perform a retry", function() {
				CloudSave.register('00', mockComm2.save);

				CloudSave.add('test', 'h1', {data: 'h1'});
				CloudSave.add('00', 'h2', {data: 'h2'});
				CloudSave.flush();

				mockPromise.reject(errorObj);
				mockPromise2.resolve();

				var states = CloudSave.getStates();
				expect(states).toEqual(['warning', 'idle']);
			});

		});
	});	// flush

});