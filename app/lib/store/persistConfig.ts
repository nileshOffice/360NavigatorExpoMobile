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
        'lastVisitedRoute',
        'selectedSite',
        "safetyAcknowledged"
    ],
};

export const assetWalkDownPersistConfig: PersistConfig<any> = {
    key: 'assetWalkDown',
    storage: AsyncStorage,
    whitelist: [
        "selectedTab",
        "selectedActivity",
    ],
};