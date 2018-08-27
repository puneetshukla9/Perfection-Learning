//===========================================================================================
// End-to-end Test Spec: Saving
//
//===========================================================================================
var frisby = require('frisby');

// RICK Dev
var urlBase = 'http://rtoews-hw-bachelor.kbooks.local/endpoint.php/';

// TEST
//var urlBase = 'http://alghwstaging.kineticmath.com/endpoint.php/';

// LIVE
//var urlBase = 'http://www.kineticmath.com/endpoint.php/';

var url = urlBase + 'save';
var inspect = urlBase + 'inspect/';

var cookie = 'kid_dev=j4qa38oss374bc2h5nd0fe3sq6';
var options = {
	json: true,
	headers: {Cookie: cookie}
};

//=======================================================
// Verify results
//=======================================================
function verify(desc, expected)
{
	return this.afterJSON(function(json) {
		frisby.create(desc)
			.get(inspect + json.aid)

			.expectStatus(200)
			.expectJSON(expected)

			.toss()
	});

}

//=======================================================
//=======================================================
function getFullDesc(suite)
{
    var desc = suite.description;
	suite = suite.suite;

	while (suite) {
        desc = suite.description + " " + desc;
        suite = suite.parentSuite;
	}

    return desc;
}

//=======================================================
//=======================================================
describe("Save", function() {

	//=======================================================
	//=======================================================
	beforeEach(function() {
		var name = getFullDesc(this);

		server = frisby.create(name);
		server.verify = verify;
	});

	//=======================================================
	//=======================================================
	it("should generate a 404 for unknown routes", function() {
		server
			.get(url + 'fake')
			.expectStatus(404)
			.toss();
	});

	//=======================================================
	//=======================================================
	describe("mechanics", function() {

		//=======================================================
		//=======================================================
		it("should create a new assignment when saving with a temp ID", function() {
			server
				.put(url, [
					{name: {aid: '_1', name: 'Automated test'}}
				], options)

				.expectHeaderContains('Content-Type', 'json')
				.expectStatus(200)

				.expectJSONTypes({
					aid: String,
					order: Array,
					remap: null
				})

				.expectJSON({
					order: [],
					remap: null,
				})

				.verify(getFullDesc(this), {
					name: 'Automated test'
				})

				.toss();
		});

		//=======================================================
		//=======================================================
		it("should accept multiple actions", function() {

			server
				.put(url, [
					{name: {aid: '_1', data: 'Multiple test'}},
					{mode: {aid: '_1', data: 'homework'}},
					{tries: {aid: '_1', data: 7}}
				], options)

				.expectHeaderContains('Content-Type', 'json')
				.expectStatus(200)

				.expectJSONTypes({
					aid: String,
					order: Array,
					remap: null
				})

				.expectJSON({
					order: [],
					remap: null,
				})

				.verify(getFullDesc(this), {
					name: 'Multiple test',
					problem_set_type: 'homework',
					iterations: '7'
				})

				.toss();
		});

		//=======================================================
		//=======================================================
		it("should elegantly handle resends where the client didn't get a 200 response", function() {
			// Add a problem

			// Add the same problem

			// Was it added only once?
		});

	});

	//=======================================================
	//=======================================================
	describe("metadata", function() {

		//=======================================================
		//=======================================================
		it("should allow name changes", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow mode changes", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow submission changes", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow scoring changes", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow note changes", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow sharing changes", function() {

		});

	});


	//=======================================================
	//=======================================================
	describe("choosing", function() {

		//=======================================================
		//=======================================================
		it("should allow adding problems", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow removing problems", function() {

		});

	});

	//=======================================================
	//=======================================================
	describe("edit", function() {

		//=======================================================
		//=======================================================
		it("should allow point changes", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow removing problems", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow increasing quantity (rapid adds)", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow decreasing quantity (rapid removal)", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow removing problems with temp IDs", function() {

		});

		//=======================================================
		//=======================================================
		it("should send a resync when removing problems with temp IDs", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow multiple point change requests", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow reordering", function() {

		});

		//=======================================================
		//=======================================================
		it("should allow multiple reorder requests", function() {

		});

		//=======================================================
		//=======================================================
		it("should handle reordering using temp IDs", function() {

		});
	});

});