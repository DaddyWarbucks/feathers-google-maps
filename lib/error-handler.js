const feathersErrors = require('@feathersjs/errors');

module.exports = function errorHandler(error, params) {

  Object.assign(params, { googleMaps: { ...params.googleMaps, error } });

  const { response } = error;

  let feathersError;

  if (response.status && feathersErrors[response.status]) {
    feathersError = new feathersErrors[response.status](
      response.data && response.data.error_message || error.message,
      response.data
    );
  } else {
    feathersError = new feathersErrors.FeathersError(
      response.data && response.data.error_message || error.message,
      response.data && response.data.status,
      response.status,
      response.data && response.data.status,
      response.data
    );
  }

  return Promise.reject(feathersError);
};
