import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './redux/store/Store';
import LodResource from './util/LodResource';

const App = () => {

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <LodResource />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;