import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import authService from "./services/authService";
import typeOfServiceService from "./services/typeOfServiceService";
import reportService from "./services/reportService";

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [authService.reducerPath]: authService.reducer,
    [typeOfServiceService.reducerPath]: typeOfServiceService.reducer,
    [reportService.reducerPath]: reportService.reducer,
    authReducer: authReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authService.middleware,
      typeOfServiceService.middleware,
      reportService.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;