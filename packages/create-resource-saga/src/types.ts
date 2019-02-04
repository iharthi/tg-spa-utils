import { match } from 'react-router';
import { Attachments, Query, ResourceMethods } from 'tg-resources';


// To future me: Move this to `tg-resources`
export type Kwargs<KW> = { [K in keyof KW]?: string | undefined; };


export interface ActionPayload<
    KW extends Kwargs<KW> = {}, Data = any
> {
    method?: ResourceMethods;
    kwargs?: KW | null;
    query?: Query | null;
    data?: Data;
    attachments?: Attachments | null;
}

export interface MetaOptions {
    [key: string]: any;
}

export interface ActionType <
    T extends string, Meta extends MetaOptions = {}, KW extends Kwargs<KW> = {}, Data = any
> {
    type: T;
    payload: ActionPayload<KW, Data>;
    meta: Meta;
}


export interface ResourceAction<T extends string, Meta extends MetaOptions = {}, KW extends Kwargs<KW> = {}, Data = any> {
    (payload: ActionPayload<KW, Data>, meta?: Meta | MetaOptions): ActionType<T, Meta | MetaOptions, KW, Data>;

    getType?: () => T;
}


export type ResourceSaga<
    T extends string,
    Meta extends {} = {},
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> = (matchObj: match<Params> | null, action: ActionType<T, Meta, KW, Data>) => Iterator<any>;
