var fs = require('fs');
var path = require('path');
var convert = require('..');
var expect = require('chai').expect;
var SwaggerTools = require('swagger-tools');
var Immutable = require('seamless-immutable');
var inputPath = './test/input/';
var outputPath = './test/output/';

require('mocha-jshint')();
require('mocha-jscs')();

var inputs = [
  {
    resourceListing: 'minimal/index.json',
    apiDeclarations: [
      'minimal/pets.json',
      'minimal/stores.json'
    ],
    output: 'minimal.json'
  },
  {
    resourceListing: 'embedded/index.json',
    apiDeclarations: [],
    output: 'embedded.json'
  },
  {
    resourceListing: 'petstore/index.json',
    apiDeclarations: [
      'petstore/pet.json',
      'petstore/user.json',
      'petstore/store.json'
    ],
    // TODO: petstore example output is not perfect output. Update the output
    output: 'petstore.json'
  },
  {
    resourceListing: 'complex-parameters/index.json',
    apiDeclarations: [],
    output: 'complex-parameters.json'
  }
];

// Run testInput for each input folder
inputs.forEach(testInput);

function testInput(input) {

  var outputFile = fs.readFileSync(path.join(outputPath, input.output));
  var outputObject = JSON.parse(outputFile.toString());
  var resourceListingPath = path.join(inputPath, input.resourceListing);
  var resourceListingFile = fs.readFileSync(resourceListingPath).toString();
  var resourceListing = JSON.parse(resourceListingFile);
  var apiDeclarations = input.apiDeclarations.map(function(apiDeclaration) {
    var apiDeclarationPath = path.join(inputPath, apiDeclaration);
    var apiDeclarationFile = fs.readFileSync(apiDeclarationPath).toString();
    return JSON.parse(apiDeclarationFile);
  });

  // Make resourceListing and apiDeclarations Immutable to make sure API is
  // working without touching the input objects
  resourceListing = new Immutable(resourceListing);
  apiDeclarations = new Immutable(apiDeclarations);

  // Do the conversion
  var converted = convert(resourceListing, apiDeclarations);

  // For debugging:
  // fs.writeFileSync(input.output + '-converted',
  //   JSON.stringify(converted, null, 4));

  describe('converting file: ' + input.resourceListing, function() {
    describe('output', function() {

      it('should be an object', function() {
        expect(converted).is.a('object');
      });

      it('should have info property and required properties', function() {
        expect(converted).to.have.property('info').that.is.a('object');
        expect(converted.info).to.have.property('title').that.is.a('string');
      });

      it('should have paths property that is an object', function() {
        expect(converted).to.have.property('paths').that.is.a('object');
      });

      it('should generate valid Swagger 2.0 document', function() {
        function validateCallback(validationErrors, validationResults) {
          var errors = [].concat(validationErrors || [])
            .concat((validationResults && validationResults.errors) || []);
          expect(errors).to.deep.equal([]);
        }
        SwaggerTools.specs.v2.validate(converted, validateCallback);
      });

      it('should produce the same output as output file', function() {
        expect(converted).to.deep.equal(outputObject);
      });
    });
  });

}
