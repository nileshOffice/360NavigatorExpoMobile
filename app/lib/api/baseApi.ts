import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithInterceptor } from './baseQuery';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithInterceptor,
    tagTypes: ['Auth', 'User', ],
    endpoints: (builder) => ({}),
});