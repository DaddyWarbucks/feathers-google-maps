# feathers-google-maps

> A Feathers service for Google Maps API

## Installation

```
yarn add feathers-google-maps
```

## Documentation

This service is a light wrapper around the @googlemaps/google-maps-services-js library. Please refer to the [@googlemaps/google-maps-services-js](https://github.com/googlemaps/google-maps-services-js) documenation for options that can be passed. You will also find it helpful to reference the [Google Maps Web Service APIs](https://developers.google.com/maps/apis-by-platform#web_service_apis) docs.

### Available Services

The following methods are supported and map to the appropriate @google/maps methods:

- directions
- distancematrix
- elevation
- findPlaceFromText
- geocode
- geolocate
- nearestRoads
- placeAutocomplete
- placeDetails
- placePhoto
- placeQueryAutocomplete
- placesNearby
- reverseGeocode
- snapToRoads
- textSearch
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

When using the `find(params)` method, include the `query` as the params to be passed to the underlying GoogleMaps method.

```js
app.service('directions').find({
  query: {
    origin: 'Nashville, TN',
    destination: 'Memphis, TN'
  }
});

// This will call the googlMaps method like
googleMaps.directions({
  params: {
    origin: 'Nashville, TN',
    destination: 'Memphis, TN',
    key: 'YOUR API KEY'
  }
});
```

When using the `create(data, params)` method, the `data` will be passed to the underlying GoogleMaps method.

```js
app.service('directions').create({
  origin: 'Nashville, TN',
  destination: 'Memphis, TN'
});

// This will also call the googlMaps method like
googleMaps.directions({
  params: {
    origin: 'Nashville, TN',
    destination: 'Memphis, TN',
    key: 'YOUR API KEY'
  }
});
```

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

Copyright (c) 2023

Licensed under the [MIT license](LICENSE).
