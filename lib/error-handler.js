const { GeneralError, Timeout, BadRequest } = require('@feathersjs/errors');

module.exports = function errorHandler(error, params) {

  Object.assign(params, { googleMaps: { ...params.googleMaps, error } });

  let feathersError = error;

  // Google maps sometimes throws string errors
  switch (error) {
    case 'timeout':
      feathersError = new Timeout('Google Maps timed out', error);
      break;
    case 'Missing either a valid API key, or a client ID and secret':
      feathersError = new GeneralError(error, error);
      break;
    default:
      feathersError = new BadRequest(error);
  }

  return Promise.reject(feathersError);
};
