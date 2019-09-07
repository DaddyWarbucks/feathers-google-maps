const googleMaps = require('@google/maps');
const errorHandler = require('./error-handler');
const successHandler = require('./success-handler');

module.exports = class GoogleMapsService {
  constructor (_options) {

    const { method, ...rest } = _options;

    this.googleMaps = googleMaps.createClient({ Promise: Promise, ...rest });

    const methods = Object.keys(this.googleMaps);

    if (!method || !methods.includes(method)) {
      throw new Error(
        `"${method}" is not a valid Google Maps method. Must be one of: ${methods.map(method => ' ' + method)}`
      );
    }

    this.method = (query, params) => {
      // Google maps client throws errors synchronously sometimes...
      // For example, an invalid query will not trip the .catch()
      // promise method but will instead throw synchronously.
      try {
        const customParams = params.googleMaps || {};
        return this.googleMaps[method](query, undefined, customParams)
          .asPromise()
          .then(response => successHandler(response, params))
          .catch(error => errorHandler(error, params));
      } catch (error) {
        return errorHandler(error, params)
      }
    };

  }

  find(params) {
    return this.method(params.query, params);
  }

  create(data, params) {
    return this.method(data, params);
  }

};
