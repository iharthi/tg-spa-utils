import { SagaResource } from '@tg-resources/redux-saga-router';
import { createResourceSaga, Kwargs } from '@thorgate/create-resource-saga';
import { match } from 'react-router';
import { call } from 'redux-saga/effects';
import { Query, Resource, ResourcePostMethods } from 'tg-resources';

import { FormErrorHandlerOptions, formErrorsHandler } from './formErrors';
import { defaultMessages, ErrorMessages } from './messages';
import { SaveActionType, SaveSaga } from './types';


export interface CreateFormSaveSagaOptions<
    T extends string,
    Values,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
> {
    resource?: Klass | SagaResource<Klass>;
    method?: ResourcePostMethods;

    apiSaveHook?: (matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) => any | Iterator<any>;
    successHook: (result: any, matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) => any | Iterator<any>;
    errorHook?: (options: FormErrorHandlerOptions<Values>) => void | Iterator<any>;

    messages?: ErrorMessages;
    timeoutMs?: number;

    mutateKwargs?: (matchObj: match<Params> | null, kwargs: KW | null) => any;
    mutateQuery?: (matchObj: match<Params> | null, query: Query | null) => any;
}


export const createFormSaveSaga = <
    T extends string,
    Values,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
>(options: CreateFormSaveSagaOptions<T, Values, Klass, KW, Params>): SaveSaga<T, Values, KW, Params> => {
    const {
        resource,
        method = 'post',
        apiSaveHook,
        errorHook = formErrorsHandler,
        messages = defaultMessages,
        successHook,
        timeoutMs,
        mutateKwargs,
        mutateQuery,
    } = options;

    const resourceSaga = createResourceSaga({
        resource,
        method,
        apiHook: apiSaveHook,
        successHook,
        timeoutMessage: 'Timeout reached, form save failed',
        timeoutMs,
        mutateKwargs,
        mutateQuery,
    });

    return function* handleFormSave(matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) {
        try {
            yield call(resourceSaga, matchObj, action);

        } catch (error) {
            yield call(errorHook, {
                messages,
                error,
                setErrors: action.meta.setErrors,
                setStatus: action.meta.setStatus,
            });

        } finally {
            action.meta.setSubmitting(false);
        }
    };
};
