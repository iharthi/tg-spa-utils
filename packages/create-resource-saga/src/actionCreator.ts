import { createAction } from 'typesafe-actions';

import { ActionPayload, Kwargs, MetaOptions, ResourceAction } from './types';


export const createResourceAction = <
    T extends string, Meta extends MetaOptions = {}, KW extends Kwargs<KW> = {}, Data = any
>(type: T, defaultValue: Meta | MetaOptions = {}): ResourceAction<T, Meta, KW, Data> => (
    createAction(type, (resolve) => (
        (payload: ActionPayload<KW, Data>, meta: Meta | MetaOptions = defaultValue) => resolve(payload, meta)
    ))
);
