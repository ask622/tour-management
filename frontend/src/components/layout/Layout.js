import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';

import Header from './../Header/Header';
import Routers from '../../router/Routers';
import Footer from './../footer/footer';
import ChatSupport from './../ChatSupport/ChatSupport';
import useFetch from '../../hooks/useFatch';
import { BASE_URL } from '../../utils/config';
import './layout.css';

const Layout = () => {
  const { pathname } = useLocation();
  const { data: settings } = useFetch(`${BASE_URL}/api/v1/site-content/settings`);

  useEffect(() => {
    if (!settings?.favicon) return;
    let icon = document.querySelector('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.href = settings.favicon;
  }, [settings?.favicon]);

  useEffect(() => {
    if (pathname.startsWith('/tour/')) return;
    const websiteName = settings?.websiteName || 'Yatraventure';
    const pageNames = {
      '/home': 'Discover Your Next Adventure',
      '/about': 'Our Story',
      '/tours': 'Explore Tours',
      '/contact': 'Contact Our Travel Team',
      '/account': 'My Trips',
      '/login': 'Sign In',
      '/register': 'Create Your Account',
    };
    const pageName = pageNames[pathname] || websiteName;
    document.title = `${pageName} | ${websiteName}`;
    const descriptions = {
      '/home': 'Find thoughtfully planned tours, local experiences and your next great escape with Yatraventure.',
      '/about': 'Discover the people, purpose and local perspective behind Yatraventure journeys.',
      '/tours': 'Explore curated tours and find a journey that fits your destination, dates and travel style.',
      '/contact': 'Talk to the Yatraventure travel team about a tour, a custom trip or your booking.',
      '/account': 'Manage your Yatraventure profile and travel booking requests.',
    };
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = descriptions[pathname] || 'Thoughtful travel experiences, curated tours and local adventures with Yatraventure.';
  }, [pathname, settings?.websiteName]);

  if (pathname.startsWith('/admin')) {
    return <Routers />;
  }
  if (settings?.maintenanceMode) {
    return (
      <main className="maintenance-page">
        <div className="maintenance-card">
          <span className="ri-tools-line" aria-hidden="true" />
          <p>BACK SOON</p>
          <h1>{settings.websiteName || 'Yatraventure'} is taking a short break.</h1>
          <p>We’re making improvements to your travel experience. Please check back soon.</p>
        </div>
      </main>
    );
  }

  return <>
  <Header settings={settings || {}} />
  <Routers/>
  <ChatSupport/>
  <Footer settings={settings || {}} />
    </>
  
}

export default Layout