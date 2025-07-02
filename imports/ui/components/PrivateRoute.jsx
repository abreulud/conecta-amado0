import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

export const PrivateRoute = () => {
  const isLoggedIn = Meteor.userId();
  const keepLoggedIn = localStorage.getItem('keepLoggedIn') === 'true';
  let firstLogin = true;

  if (isLoggedIn && firstLogin) {
    firstLogin = false;
    return <Outlet />;
  }

  if (isLoggedIn && keepLoggedIn) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};
