import { configureStore } from '@reduxjs/toolkit';
import GlobleReducer from '../reduces/reducers';

export const store = configureStore({
  reducer: {
    songs: GlobleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;