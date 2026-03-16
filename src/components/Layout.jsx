import React from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';
import BackToTop from './BackToTop.jsx';

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <BackToTop />
      <Outlet />
    </>
  );
}
