/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Apigee Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var urlParse = require('url').parse;
var clone = require('lodash.clonedeep');

var primitiveTypes = [
  'string',
  'number',
  'boolean',
  'integer',
  'array',
  'void',
  'File'
];

if (typeof window === 'undefined') {
  module.exports = convert;
} else {
  window.SwaggerConverter = window.SwaggerConverter || {
    convert: convert
  };
}

/*
 * Converts Swagger 1.2 specs file to Swagger 2.0 specs.
 * @param resourceListing {object} - root Swagger 1.2 document where it has a
 *  list of all paths
 * @param apiDeclarations {array} - a list of all resources listed in
 * resourceListing. Array of objects
 * @returns {object} - Fully converted Swagger 2.0 document
*/
function convert(resourceListing, apiDeclarations) {
  if (typeof resourceListing !== 'object') {
    throw new Error('resourceListing must be an object');
  }
  if (!Array.isArray(apiDeclarations)) {
    apiDeclarations = [];
  }

  var convertedSecurityNames = {};
  var models = {};
  var result = {
    swagger: '2.0',
    info: buildInfo(resourceListing),
    paths: {}
  };

  if (resourceListing.authorizations) {
    result.securityDefinitions = buildSecurityDefinitions(resourceListing,
      convertedSecurityNames);
  }

  if (resourceListing.basePath) {
    assignPathComponents(resourceListing.basePath, result);
  }

  extend(models, resourceListing.models);

  // Handle embedded documents
  if (Array.isArray(resourceListing.apis)) {
    if (apiDeclarations.length > 0) {
      result.tags = [];
    }
    resourceListing.apis.forEach(function(api) {
      if (result.tags) {
        result.tags.push({
          'name': api.path.replace('.{format}', '').substring(1),
          'description': api.description});
      }
      if (Array.isArray(api.operations)) {
        result.paths[api.path] = buildPath(api, resourceListing);
      }
    });
  }

  apiDeclarations.forEach(function(apiDeclaration) {

    // For each apiDeclaration if there is a basePath, assign path components
    // This might override previous assignments
    if (apiDeclaration.basePath) {
      assignPathComponents(apiDeclaration.basePath, result);
    }

    if (!Array.isArray(apiDeclaration.apis)) { return; }
    apiDeclaration.apis.forEach(function(api) {
      result.paths[api.path] = buildPath(api, apiDeclaration);

    });
    if (apiDeclaration.models && Object.keys(apiDeclaration.models).length) {
      extend(models, transformAllModels(apiDeclaration.models));
    }
  });

  if (Object.keys(models).length) {
    result.definitions = transformAllModels(models);
  }

  return result;
}

/*
 * Builds "info" section of Swagger 2.0 document
 * @param source {object} - Swagger 1.2 document object
 * @returns {object} - "info" section of Swagger 2.0 document
*/
function buildInfo(source) {
  var info = {
    version: source.apiVersion,
    title: 'Title was not specified'
  };

  if (typeof source.info === 'object') {

    if (source.info.title) {
      info.title = source.info.title;
    }

    if (source.info.description) {
      info.description = source.info.description;
    }

    if (source.info.contact) {
      info.contact = {
        email: source.info.contact
      };
    }

    if (source.info.license) {
      info.license = {
        name: source.info.license,
        url: source.info.licenseUrl
      };
    }

    if (source.info.termsOfServiceUrl) {
      info.termsOfService = source.info.termsOfServiceUrl;
    }
  }

  return info;
}

/*
 * Assigns host, basePath and schemes for Swagger 2.0 result document from
 * Swagger 1.2 basePath.
 * @param basePath {string} - the base path from Swagger 1.2
 * @param result {object} - Swagger 2.0 document
*/
function assignPathComponents(basePath, result) {
  var url = urlParse(basePath);
  result.host = url.host;
  result.basePath = url.path;
  if (url.protocol) {
    result.schemes = [url.protocol.substr(0, url.protocol.length - 1)];
  }
}

/*
 * Process a data type object.
 *
 * @see {@link https://github.com/swagger-api/swagger-spec/blob/master/versions/
 *  1.2.md#433-data-type-fields}
 *
 * @param field {object} - A data type field
 *
 * @returns {object} - Swagger 2.0 equivalent
 */
function processDataType(field, fixRef) {
  field = clone(field);

  // Checking for the existence of '#/definitions/' is related to this bug:
  //   https://github.com/apigee-127/swagger-converter/issues/6
  if (field.$ref && field.$ref.indexOf('#/definitions/') === -1) {
    field.$ref = '#/definitions/' + field.$ref;
  } else if (field.items && field.items.$ref &&
             field.items.$ref.indexOf('#/definitions/') === -1) {
    field.items.$ref = '#/definitions/' + field.items.$ref;
  }

  if (fixRef) {
    if (field.type && primitiveTypes.indexOf(field.type) === -1) {
      field = {$ref: '#/definitions/' + field.type};
    }
  }

  if (field.minimum) {
    field.minimum = fixNonStringValue(field.minimum);
  }

  if (field.maximum) {
    field.maximum = fixNonStringValue(field.maximum);
  }

  if (field.defaultValue) {
    field.default = field.defaultValue;
    delete field.defaultValue;
    if (field.type && field.type !== 'string') {
      field.default = fixNonStringValue(field.default);
    }
  }

  return field;
}

/*
 * Builds a Swagger 2.0 path object form a Swagger 1.2 path object
 * @param api {object} - Swagger 1.2 path object
 * @param apiDeclaration {object} - parent apiDeclaration
 * @returns {object} - Swagger 2.0 path object
*/
function buildPath(api, apiDeclaration) {
  var path = {};

  api.operations.forEach(function(oldOperation) {
    var method = oldOperation.method.toLowerCase();
    path[method] = buildOperation(oldOperation, apiDeclaration.produces,
      apiDeclaration.consumes, apiDeclaration.resourcePath);
  });

  return path;
}

/*
 * Builds a Swagger 2.0 operation object form a Swagger 1.2 operation object
 * @param oldOperation {object} - Swagger 1.2 operation object
 * @param produces {array} - from containing apiDeclaration
 * @param consumes {array} - from containing apiDeclaration
 * @returns {object} - Swagger 2.0 operation object
*/
function buildOperation(oldOperation, produces, consumes, resourcePath) {
  var operation = {
    responses: {},
    description: oldOperation.description || ''
  };

  if (resourcePath) {
    operation.tags = [];
    operation.tags.push(resourcePath.substr(1));
  }

  if (oldOperation.summary) {
    operation.summary = oldOperation.summary;
  }

  if (oldOperation.nickname) {
    operation.operationId = oldOperation.nickname;
  }

  if (produces) { operation.produces = produces; }
  if (consumes) { operation.consumes = consumes; }

  if (Array.isArray(oldOperation.parameters) &&
      oldOperation.parameters.length) {
    operation.parameters = oldOperation.parameters.map(function(parameter) {
      return buildParameter(parameter);
    });
  }

  if (Array.isArray(oldOperation.responseMessages)) {
    oldOperation.responseMessages.forEach(function(oldResponse) {
      operation.responses[oldResponse.code] = buildResponse(oldResponse);
    });
  }

  if (!Object.keys(operation.responses).length ||
    (!operation.responses[200] && oldOperation.type)) {
    operation.responses[200] = {
      description: 'No response was specified'
    };
  }

  if (oldOperation.type && oldOperation.type !== 'void') {
    var schema = buildParamType(oldOperation);
    if (primitiveTypes.indexOf(oldOperation.type) === -1) {
      schema = {
        '$ref': '#/definitions/' + oldOperation.type
      };
    }
    operation.responses['200'].schema = schema;
  }

  return operation;
}

/*
 * Builds a Swagger 2.0 response object form a Swagger 1.2 response object
 * @param oldResponse {object} - Swagger 1.2 response object
 * @returns {object} - Swagger 2.0 response object
*/
function buildResponse(oldResponse) {
  var response = {};

  // TODO: Confirm this is correct
  response.description = oldResponse.message;

  return response;
}

/*
 * Converts Swagger 1.2 parameter object to Swagger 2.0 parameter object
 * @param oldParameter {object} - Swagger 1.2 parameter object
 * @returns {object} - Swagger 2.0 parameter object
*/
function buildParameter(oldParameter) {
  var parameter = {
    in: oldParameter.paramType,
    description: oldParameter.description,
    name: oldParameter.name,
    required: !!oldParameter.required
  };

  if (primitiveTypes.indexOf(oldParameter.type) === -1) {
    parameter.schema = {$ref: '#/definitions/' + oldParameter.type};
  } else if (oldParameter.paramType === 'body') {
    parameter.schema = buildParamType(oldParameter);
  } else {
    extend(parameter, buildParamType(oldParameter));
  }

  // form was changed to formData in Swagger 2.0
  if (parameter.in === 'form') {
    parameter.in = 'formData';
  }

  return parameter;
}

/*
 * Converts Swagger 1.2 type fields from parameter object into their Swagger 2.0 conterparts
 * @param oldParameter {object} - Swagger 1.2 parameter object
 * @returns {object} - Swagger 2.0 type fields from parameter object
*/
function buildParamType(oldParameter) {
  var paramType = {};
  var copyProperties = [
    'default',
    'maximum',
    'minimum',
    'items'
  ];

  oldParameter = processDataType(oldParameter, false);

  paramType.type = oldParameter.type.toLowerCase();

  copyProperties.forEach(function(name) {
    if (typeof oldParameter[name] !== 'undefined') {
      paramType[name] = oldParameter[name];
    }
  });

  if (typeof oldParameter.defaultValue !== 'undefined') {
    paramType.default = oldParameter.defaultValue;
  }

  return paramType;
}

/*
 * Convertes Swagger 1.2 authorization definitions to Swagger 2.0 security
 *   definitions
 *
 * @param resourceListing {object} - The Swagger 1.2 Resource Listing document
 * @param convertedSecurityNames {object} - A list of original Swagger 1.2
 * authorization names and the new Swagger 2.0
 *  security names associated with it (This is required because Swagger 2.0 only
 *  supports one oauth2 flow per security definition but in Swagger 1.2 you
 *  could describe two (implicit and authorization_code).  To support this, we
 *  will create a per-flow version of each oauth2 definition, where necessary,
 *  and keep track of the new names so that when we handle security references
 *  we reference things properly.)
 *
 * @returns {object} - Swagger 2.0 security definitions
 */
function buildSecurityDefinitions(resourceListing, convertedSecurityNames) {
  var securityDefinitions = {};

  Object.keys(resourceListing.authorizations).forEach(function(name) {
    var authorization = resourceListing.authorizations[name];
    var createDefinition = function createDefinition(oName) {
      var securityDefinition = securityDefinitions[oName || name] = {
        type: authorization.type
      };

      if (authorization.passAs) {
        securityDefinition.in = authorization.passAs;
      }

      if (authorization.keyname) {
        securityDefinition.name = authorization.keyname;
      }

      return securityDefinition;
    };

    // For oauth2 types, 1.2 describes multiple "flows" in one auth and for 2.0,
    // that is not an option so we need to
    // create one security definition per flow and keep track of this mapping.
    if (authorization.grantTypes) {
      convertedSecurityNames[name] = [];

      Object.keys(authorization.grantTypes).forEach(function(gtName) {
        var grantType = authorization.grantTypes[gtName];
        var oName = name + '_' + gtName;
        var securityDefinition = createDefinition(oName);

        convertedSecurityNames[name].push(oName);

        if (gtName === 'implicit') {
          securityDefinition.flow = 'implicit';
        } else {
          securityDefinition.flow = 'accessCode';
        }

        switch (gtName) {
        case 'implicit':
          securityDefinition.authorizationUrl = grantType.loginEndpoint.url;
          break;

        case 'authorization_code':
          securityDefinition.authorizationUrl =
            grantType.tokenRequestEndpoint.url;
          securityDefinition.tokenUrl = grantType.tokenEndpoint.url;
          break;
        }

        if (authorization.scopes) {
          securityDefinition.scopes = {};

          authorization.scopes.forEach(function(scope) {
            securityDefinition.scopes[scope.scope] = scope.description ||
              ('Undescribed ' + scope.scope);
          });
        }
      });
    } else {
      createDefinition();
    }
  });

  return securityDefinitions;
}

/*
 * Transforms a Swagger 1.2 model object to a Swagger 2.0 model object
 * @param model {object} - (mutable) Swagger 1.2 model object
*/
function transformModel(model) {
  if (typeof model.properties === 'object') {
    Object.keys(model.properties).forEach(function(propertieName) {
      model.properties[propertieName] =
        processDataType(model.properties[propertieName], true);
    });
  }
}

/*
 * Transfers the "models" object of Swagger 1.2 specs to Swagger 2.0 definitions
 * object
 * @param models {object} - (mutable) an object containing Swagger 1.2 objects
 * @returns {object} - transformed modles object
*/
function transformAllModels(models) {
  var modelsClone = clone(models);

  if (typeof models !== 'object') {
    throw new Error('models must be object');
  }

  var hierarchy = {};

  Object.keys(modelsClone).forEach(function(modelId) {
    var model = modelsClone[modelId];
    delete model['id'];

    transformModel(model);

    if (model.subTypes) {
      hierarchy[modelId] = model.subTypes;

      delete model.subTypes;
    }
  });

  Object.keys(hierarchy).forEach(function(parent) {
    hierarchy[parent].forEach(function(childId) {
      var childModel = modelsClone[childId];

      if (childModel) {
        var allOf = (childModel.allOf || []).concat({
          $ref: '#/definitions/' + parent
        }).concat(clone(childModel));
        for (var member in childModel) {
          delete childModel[member];
        }
        childModel.allOf = allOf;
      }
    });
  });

  return modelsClone;
}

/*
 * Extends an object with another
 * @param source {object} - object that will get extended
 * @parma destination {object} - object the will used to extend source
*/
function extend(source, destination) {
  if (typeof source !== 'object') {
    throw new Error('source must be objects');
  }

  if (typeof destination === 'object') {
    Object.keys(destination).forEach(function(key) {
      source[key] = destination[key];
    });
  }
}

/*
 * Convert string values into the proper type.
 * @param value {*} - value to convert
 * @returns {*} - transformed modles object
*/
function fixNonStringValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    throw Error('incorect property value: ' + e.message);
  }
}
