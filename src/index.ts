import type { ClientOptions } from '@googlemaps/google-maps-services-js';
import { Client } from '@googlemaps/google-maps-services-js';
import type { FeathersError, Errors } from '@feathersjs/errors';
import { errors as feathersErrors, GeneralError } from '@feathersjs/errors';

import type { Params } from '@feathersjs/feathers';

type GoogleMapsErrors = Omit<Errors, 'FeathersError'>;

export type GoogleMapsServiceOptions<Method extends GoogleMapsMethod> =
  ClientOptions & {
    key: string;
    method: Method;
  };

export type GoogleMapsMethod =
  | 'directions'
  | 'distancematrix'
  | 'elevation'
  | 'findPlaceFromText'
  | 'geocode'
  | 'reverseGeocode'
  | 'geolocate'
  | 'nearestRoads'
  | 'placeAutocomplete'
  | 'placeDetails'
  | 'placePhoto'
  | 'placesNearby'
  | 'placeQueryAutocomplete'
  | 'textSearch'
  | 'snapToRoads'
  | 'timezone';

export type GoogleMapsParams<Method extends GoogleMapsMethod> = {
  key?: string;
} & Parameters<Client[Method]>[0]['params'];

export type GoogleMapsRequest<Method extends GoogleMapsMethod> = Omit<
  Parameters<Client[Method]>[0],
  'params'
>;

export type GoogleMapsServiceResponse<Method extends GoogleMapsMethod> =
  ReturnType<Client[Method]> extends Promise<infer Response> ? Response : never;

export type GoogleMapsServiceResponseData<Method extends GoogleMapsMethod> =
  GoogleMapsServiceResponse<Method> extends { data: infer Data } ? Data : never;

export type AdditionalParams<Method extends GoogleMapsMethod> = {
  googleMaps?: GoogleMapsRequest<Method> & { key?: string };
};

export class GoogleMapsService<Method extends GoogleMapsMethod> {
  googleKey: string;
  googleMethod: Method;
  googleMapsService: Client;

  constructor(options: GoogleMapsServiceOptions<Method>) {
    const { method, key, ...googleConfig } = options;
    this.googleKey = key;
    this.googleMethod = method;
    this.googleMapsService = new Client(googleConfig);
  }

  method(
    googleParams: GoogleMapsParams<Method>,
    feathersParams: AdditionalParams<Method> = {}
  ): Promise<GoogleMapsServiceResponseData<Method> | void> {
    const { googleMaps: googleOptions } = feathersParams;

    const googleKey = googleParams.key || googleOptions?.key || this.googleKey;

    if (!googleKey) {
      throw new GeneralError(
        'You must use an API key to authenticate each request to Google Maps Platform APIs. For additional information, please refer to http://g.co/dev/maps-no-account'
      );
    }

    // @ts-expect-error TODO: fix this
    // This works when commenting out the directions GoogleMapsMethod
    return this.googleMapsService[this.googleMethod]({
      // @ts-expect-error TODO: fix this
      params: {
        key: googleKey,
        ...googleParams,
      },
      ...googleOptions,
    })
      .then((response: any) => successHandler(response, feathersParams))
      .catch((error) => errorHandler(error, feathersParams));
  }

  find(
    params: Params<GoogleMapsParams<Method>> & AdditionalParams<Method>
  ): Promise<GoogleMapsServiceResponseData<Method> | void> {
    const { query: googleParams, ...feathersParams } = params;
    if (!googleParams) throw new GeneralError('Missing query parameters');
    return this.method(googleParams, feathersParams);
  }

  create(
    googleParams: GoogleMapsParams<Method>,
    feathersParams: AdditionalParams<Method>
  ): Promise<GoogleMapsServiceResponseData<Method> | void> {
    return this.method(googleParams, feathersParams);
  }
}

function successHandler<Method extends GoogleMapsMethod>(
  response: GoogleMapsServiceResponse<Method>,
  params: AdditionalParams<Method>
): GoogleMapsServiceResponseData<Method> {
  Object.assign(params, { googleMaps: { ...params.googleMaps, response } });

  // @ts-expect-error TODO: fix this
  return response.data;
}

function errorHandler<Method extends GoogleMapsMethod>(
  error: any,
  params: AdditionalParams<Method>
) {
  Object.assign(params, { googleMaps: { ...params.googleMaps, error } });

  const { response } = error;

  let feathersError: FeathersError;

  if (
    response.status &&
    feathersErrors[response.status as keyof GoogleMapsErrors]
  ) {
    feathersError = new feathersErrors[
      response.status as keyof GoogleMapsErrors
    ](response.data?.error_message || error.message, response.data);
  } else {
    feathersError = new feathersErrors.FeathersError(
      response.data?.error_message || error.message,
      response.data?.status,
      response.status,
      response.data?.status,
      response.data
    );
  }

  throw feathersError;
}
