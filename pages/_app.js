import '@/styles/globals.css'
import wrapper from '@/lib/store/configureStore'
import PropTypes from "prop-types";
import { SessionProvider } from "next-auth/react"

function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(App);