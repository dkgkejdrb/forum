import '@/styles/globals.css'
import wrapper from '@/lib/store/configureStore'
import PropTypes from "prop-types";
import { SessionProvider } from "next-auth/react"
import { Provider } from 'react-redux';

function App({ 
  Component, 
  // pageProps: { session, ...pageProps } 
  ...rest
}) {
  const { store, props } = wrapper.useWrappedStore(rest);
  return (
    // <SessionProvider session={session}>
    //   <Component {...pageProps} />
    // </SessionProvider>
    <Provider store={store}>
      <Component {...props.pageProps}/>
    </Provider>
  )
}

// App.propTypes = {
//   Component: PropTypes.elementType.isRequired,
// };

// export default wrapper.withRedux(App);

export default App