module.exports = function successHandler(response, params) {

  Object.assign(params, { googleMaps: { ...params.googleMaps, response } });

  return Promise.resolve(response.data);
};