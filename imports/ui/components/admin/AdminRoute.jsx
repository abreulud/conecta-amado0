import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

export const AdminRoute = () => {
  const user = useTracker(() => Meteor.user());

  if (!user || !user.profile?.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
