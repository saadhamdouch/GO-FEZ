import { configureStore } from '@reduxjs/toolkit';
import userApi from '../services/api/UserApi';

const configurestore = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['user.socketConnection'],
        ignoredActions: [
          'user/setSocketConnection',
          'UserApi/subscriptions/unsubscribeQueryResult',
          'UserApi/mutations/removeMutationResult',
          'subjectApi/subscriptions/unsubscribeQueryResult',
          'subjectApi/mutations/removeMutationResult',
          'brandApi/subscriptions/unsubscribeQueryResult',
          'brandApi/mutations/removeMutationResult',
        ],
      },
    })
      .concat(userApi.middleware)
});
export default configurestore;
export type RootState = ReturnType<typeof configurestore.getState>;
export type AppDispatch = typeof configurestore.dispatch;
