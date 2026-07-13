import React from 'react'

import Header from './../Header/Header';
import Routers from '../../router/Routers';
import Footer from './../footer/footer';
import ChatSupport from './../ChatSupport/ChatSupport';

const Layout = () => {
  return <>
  <Header/>
  <Routers/>
  <ChatSupport/>
  <Footer/>
    </>
  
}

export default Layout