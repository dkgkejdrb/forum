import '@/styles/globals.css'
import wrapper from '@/lib/store/configureStore'
import { Provider } from 'react-redux';

const App = ({ Component, ...rest}) => {
  const { store, props } = wrapper.useWrappedStore(rest);
  
  return (
    <Provider store={store}>
      <Component {...props.pageProps}/>
    </Provider>
  )
}

export default App