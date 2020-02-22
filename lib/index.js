// const googleMaps = require('@google/maps');
const googleMaps = require('@googlemaps/google-maps-services-js');
const { GeneralError } = require('@feathersjs/errors');
const errorHandler = require('./error-handler');
const successHandler = require('./success-handler');


module.exports = class GoogleMapsService {
  constructor (opts) {
    this.options = { ...opts };
    this.googleMaps = new googleMaps.Client({});
  }

  method(googleParams, feathersParams) {
    const { method, key } = this.options;
    const googleKey = key || googleParams.key;
    if (!googleKey) {
      throw new GeneralError('You must use an API key to authenticate each request to Google Maps Platform APIs. For additional information, please refer to http://g.co/dev/maps-no-account');
    }
    return this.googleMaps[method]({
      params: {
        key: googleKey,
        ...googleParams
      }
    })
      .then(response => successHandler(response, feathersParams))
      .catch(error => errorHandler(error, feathersParams));
  };

  find(feathersParams) {
    return this.method(feathersParams.query, feathersParams);
  }

  create(data, feathersParams) {
    return this.method(data, feathersParams);
  }

};
