import { ActionPayload, Kwargs } from '@thorgate/create-resource-saga';
import { createAction } from 'typesafe-actions';

import { SaveAction, SaveMeta } from './types';


export const createSaveAction = <
    T extends string, Values, KW extends Kwargs<KW> = {}
>(type: T): SaveAction<T, Values, KW> => (
    createAction(type, (resolve) => (
        (payload: ActionPayload<KW, Values>, meta: SaveMeta<Values>) => resolve(payload, meta)
    ))
);
