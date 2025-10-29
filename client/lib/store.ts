import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../services/slices/authSlice';
import userApi from '../services/api/UserApi';
import themeApi from '../services/api/ThemeApi';
import circuitApi from '../services/api/CircuitApi';
import poiApi from '../services/api/PoiApi';
import categoryApi from '../services/api/CategoryApi';
import cityApi from '../services/api/CityApi';
// 1. Import the new API
import {circuitProgressApi} from '../services/api/CircuitProgressApi'; 

// 2. Import the logger
import logger from 'redux-logger';

// 3. Check for development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// 4. Create a middleware array
const middleware = [
  userApi.middleware,
  themeApi.middleware,
  circuitApi.middleware,
  poiApi.middleware,
  categoryApi.middleware,
  cityApi.middleware,
  // 5. Add the new middleware
  circuitProgressApi.middleware,
];

// 6. Conditionally add the logger
if (isDevelopment) {
  middleware.push(logger as any);
}

const configurestore = configureStore({
  reducer: {
    auth: authReducer,
    [userApi.reducerPath]: userApi.reducer,
    [themeApi.reducerPath]: themeApi.reducer,
    [circuitApi.reducerPath]: circuitApi.reducer,
    [poiApi.reducerPath]: poiApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [cityApi.reducerPath]: cityApi.reducer,
    // 7. Add the new reducer
    [circuitProgressApi.reducerPath]: circuitProgressApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['user.socketConnection'],
        ignoredActions: [
          'user/setSocketConnection',
          'userApi/subscriptions/unsubscribeQueryResult',
          'userApi/mutations/removeMutationResult',
          'themeApi/subscriptions/unsubscribeQueryResult',
          'themeApi/mutations/removeMutationResult',
          'circuitApi/subscriptions/unsubscribeQueryResult',
          'circuitApi/mutations/removeMutationResult',
          'poiApi/subscriptions/unsubscribeQueryResult',
          'poiApi/mutations/removeMutationResult',
          'categoryApi/subscriptions/unsubscribeQueryResult',
          'categoryApi/mutations/removeMutationResult',
          'cityApi/subscriptions/unsubscribeQueryResult',
          'cityApi/mutations/removeMutationResult',
          // 8. Add ignored actions for the new API
          'circuitProgressApi/subscriptions/unsubscribeQueryResult',
          'circuitProgressApi/mutations/removeMutationResult',
        ],
      },
    })
      // 9. Concat the middleware array
      .concat(middleware),
  
  // Enable Redux DevTools only in development
  devTools: isDevelopment,
});

export default configurestore;
export type RootState = ReturnType<typeof configurestore.getState>;
export type AppDispatch = typeof configurestore.dispatch;