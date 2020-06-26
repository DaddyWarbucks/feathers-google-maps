const googleMapsService = require('@googlemaps/google-maps-services-js');
const { GeneralError } = require('@feathersjs/errors');
const errorHandler = require('./error-handler');
const successHandler = require('./success-handler');


module.exports = class GoogleMapsService {
  constructor (options) {
    const { method, key, ...googleConfig } = options;
    this.googleKey = key;
    this.googleMethod = method;
    this.googleMapsService = new googleMapsService.Client(googleConfig);
  }

  method(googleParams, feathersParams = {}) {
    const { googleMaps: googleOptions } = feathersParams;

    const googleKey = googleParams.key
      || googleOptions && googleOptions.key
      || this.googleKey

    if (!googleKey) {
      throw new GeneralError('You must use an API key to authenticate each request to Google Maps Platform APIs. For additional information, please refer to http://g.co/dev/maps-no-account');
    }

    return this.googleMapsService[this.googleMethod]({
      params: {
        key: googleKey,
        ...googleParams
      },
      ...googleOptions
    })
      .then(response => successHandler(response, feathersParams))
      .catch(error => errorHandler(error, feathersParams));
  };

  find(params) {
    const { query: googleParams, ...feathersParams } = params;
    return this.method(googleParams, feathersParams);
  }

  create(googleParams, feathersParams) {
    return this.method(googleParams, feathersParams);
  }

};
