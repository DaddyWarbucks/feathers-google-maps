# feathers-google-maps

> A Feathers service for Google Maps API

## Installation

```
yarn add feathers-google-maps
```

## Documentation

This service is a light wrapper around the @google/maps library. Please refer to the [@google/maps](https://github.com/googlemaps/google-maps-services-js) documenation for options that can be passed. You will also find it helpful to reference the [Google Maps Web Service APIs](https://developers.google.com/maps/apis-by-platform#web_service_apis) docs.

This service not only allows the power of feathers hooks, events, etc, but it
also solves some common problems and shortcomings of @google/maps such as:

- Async by default. There is no need to pass the `Promise` option. It is provided by default but can be overriden by a different promise contructor. feathers-google-maps does not support callbacks.

- Catches the string errors thrown. @google/maps will sometimes throw string errors. For example, `throw 'timeout'`. These errors, and all others, are wrapped in [@feathersjs/errors](https://docs.feathersjs.com/api/errors.html)

- Catches sync errors. @google/maps will also throw sync errors where you would expect a standard `.catch()` to handle the error but is never reached. These are wrapped in a try/catch and handled asyncronously.

### Available Services

The following methods are supported and map to the appropriate @google/maps methods:

- directions
- distanceMatrix
- elevation
- elevationAlongPath
- geocode
- geolocate
- reverseGeocode
- findPlace
- places
- placesNearby
- placesRadar
- place
- placesPhoto
- placesAutoComplete
- placesQueryAutoComplete
- snapToRoads
- nearestRoads
- speedLimits
- snappedSpeedLimits
- timezone

## Creating a Service

```js
const GoogleMapsService = require('feathers-google-maps');

const Directions = new GoogleMapsService({
  key: 'YOUR API KEY',
  method: 'directions'
});

app.use('directions', Directions);
```

The service exposes two methods, `find(params)` and `create(data, params)`. These two methods are functionally equivalent. The `create()` method is added so that you can take advantage of the `.on('created')` service event.

When using the `find(params)` method, include the `query` as the query to be passed to the underlying method.

```js
app.service('directions').find({
  query: {
    origin: 'Nashville, TN',
    destination: 'Memphis, TN'
  }
});
```

When using the `create(data, params)` method, the `data` will be passed to the underlying method.

```js
app.service('directions').create({
  origin: 'Nashville, TN',
  destination: 'Memphis, TN'
});
```

@google/maps also allows you to pass custom parameters to method calls. These can be passed by adding `params.googleMaps`.
On successful calls, the raw response will be added to `params.googleMaps.response` to be accessed in your `after` hooks. On calls that threw an error, the raw error will be added to `params.googleMaps.error` to be accessed in your `error` hooks.

## Complete Example

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const GoogleMapsService = require('feathers-google-maps');

// Initialize the application
const app = feathers()
  .configure(express.rest())
  .configure(socketio())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(express.errorHandler({ html: false }));

// Create a directions service
app.use('directions', new GoogleMapsService({
  key: 'YOUR API KEY',
  method: 'directions'
}));

// Create a geocode service
app.use('geocode', new GoogleMapsService({
  key: 'YOUR API KEY',
  method: 'geocode'
}));

const directionsService = app.service('directions');
const geocodeService = app.service('geocode');

const successHook = context => {
  // On success, context.params.googleMaps will include a `response`
  console.log('Success: ', context.data, context.params.googleMaps);
}

const errorHook = context => {
  // On error, context.params.googleMaps will include an `error`
  console.log('Error: ', context.error, context.params.googleMaps);
}

directionsService.hooks(
  after: {
    find: [successHook]
    create: [successHook]
  },
  error: {
    find: [errorHook]
    create: [errorHook]
  },
);

directionsService.on('created', result => {
  console.log('Directions created event');
})

geocodeService.hooks(
  after: {
    find: [successHook]
    create: [successHook]
  },
  error: {
    find: [errorHook]
    create: [errorHook]
  },
);

geocodeService.on('created', result => {
  console.log('Geocode created event');
})

directionsService
  .find({ query: { origin: 'Nashville, TN', destination: 'Memphis, TN' } })
  .then(result => {
    console.log('Directions found', result);
  })
  .catch(error => {
    console.log('Error finding directions', error);
  });

directionsService
  .create({ origin: 'Nashville, TN', destination: 'Memphis, TN' })
  .then(result => {
    console.log('Directions created', result);
  })
  .catch(error => {
    console.log('Error creating directions', error);
  });

geocodeService
  .find({ query: { address: '1010 Forrest Ave, Nashville, TN' } })
  .then(result => {
    console.log('Geocode found', result);
  })
  .catch(error => {
    console.log('Error geocoding', error);
  });

geocodeService
  .create({ address: '1010 Forrest Ave, Nashville, TN' })
  .then(result => {
    console.log('Geocode found', result);
  })
  .catch(error => {
    console.log('Error geocoding', error);
  });

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2019

Licensed under the [MIT license](LICENSE).
