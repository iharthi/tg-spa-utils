import { resourceEffectFactory, SagaResource } from '@tg-resources/redux-saga-router';
import { match } from 'react-router';
import { call, delay, race } from 'redux-saga/effects';
import { Query, Resource, ResourceMethods } from 'tg-resources';

import { ActionType, Kwargs, ResourceSaga } from './types';


export const DEFAULT_TIMEOUT = 3000;


export interface ResourceSagaOptions<
    T extends string,
    Klass extends Resource,
    Meta extends {} = {},
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> {
    resource?: Klass | SagaResource<Klass>;
    method?: ResourceMethods;

    apiHook?: (matchObj: match<Params> | null, action: ActionType<T, Meta, KW, Data>) => any;
    successHook?: (result: any, matchObj: match<Params> | null, action: ActionType<T, Meta, KW, Data>) => any;

    timeoutMessage?: string;
    timeoutMs?: number;

    mutateKwargs?: (matchObj: match<Params> | null, kwargs: KW | null) => any;
    mutateQuery?: (matchObj: match<Params> | null, query: Query | null) => any;
}


export function createResourceSaga<
    T extends string,
    Klass extends Resource,
    Meta extends {} = {},
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
>(options: ResourceSagaOptions<T, Klass, Meta, KW, Params, Data>): ResourceSaga<T, Meta, KW, Params> {
    const {
        resource,
        method = 'fetch',
        apiHook,
        successHook,
        timeoutMessage = 'Timeout reached, resource saga failed',
        timeoutMs = DEFAULT_TIMEOUT,
        mutateKwargs,
        mutateQuery,
    } = options;

    return function* resourceSaga(matchObj: match<Params> | null, action: ActionType<T, Meta, KW, Data>) {
        let resourceEffect: any;

        let { kwargs = null, query = null } = action.payload;

        if (mutateKwargs) {
            kwargs = yield call(mutateKwargs, matchObj, kwargs);
        }

        if (mutateQuery) {
            query = yield call(mutateQuery, matchObj, query);
        }

        if (resource) {
            resourceEffect = resourceEffectFactory(resource, action.payload.method || method, {
                kwargs,
                query,
                data: action.payload.data,
                attachments: action.payload.attachments,
                requestConfig: { initializeSaga: false }, // Disable initialized saga in this context
            });
        } else if (apiHook) {
            resourceEffect = call(apiHook, matchObj, action);
        } else {
            throw new Error('Misconfiguration: "resource" or "apiFetchHook" is required');
        }

        const { response, timeout } = yield race({
            timeout: delay(timeoutMs, true),
            response: resourceEffect,
        });

        if (timeout) {
            throw new Error(timeoutMessage);
        }

        if (successHook) {
            yield call(successHook, response, matchObj, action);
        }
    };
}
