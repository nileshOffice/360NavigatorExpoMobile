import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistConfig } from 'redux-persist';

export const persistConfig: PersistConfig<any> = {
    key: 'auth',
    storage: AsyncStorage,
    whitelist: [
        'currentUser',
        'isAuthenticated',
        'isCompanySelectedByUser',
        'isSiteSelectedByUser',
        'visitFlag',
    ],
};