import React from 'react'
import {Routes,Route,Navigate} from 'react-router-dom'
import Home from './../pages/Home';
import Tours from './../pages/Tours';
import TourDetails from './../pages/TourDetails';
import Login from './../pages/Login';
import Register from './../pages/Register';
import SearchResult from './../pages/SearchResult';
import Thankyou from '../pages/Thankyou';
import About from './../pages/about'
import Gallery from '../components/image-gallery/MasonryImageGallery';

const Routers = () => {
  return (
   <Routes>
    <Route path='/' element= {<Navigate to ='/home'/>} />
    <Route path='/home' element={<Home/>} />
    <Route path='/about' element={<About/>} />

    <Route path='/tours' element={<Tours/>} />
    <Route path='/tour/:id' element={<TourDetails/>} />
    <Route path='/login' element={<Login/>} />
    <Route path='/register' element={<Register/>} />
    <Route path='/Thank-you' element={<Thankyou/>} />
    <Route path='/Gallery' element={<Gallery/>} />
    
    {/* Search Result Route */}
    <Route path='/tours/search' element={<SearchResult/>} />

    </Routes>
  )
}

export default Routers