import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { AuthForm } from '../AuthForm';

export const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);

    Meteor.loginWithPassword(formData.email, formData.password, err => {
      setIsLoading(false);
      if (err) {
        setError(err.reason);
        return;
      }
      if (Meteor.user()?.profile?.isAdmin) {
        navigate('/admin/dashboard');
        return;
      }
      Meteor.logout();
      setError('Not authorized as admin');
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f4ef] px-4">
      <div className="flex w-full max-w-6xl">
        <AuthForm
          title="Admin Login"
          step={0}
          onSubmit={handleSubmit}
          fields={[
            {
              name: 'email',
              label: 'Admin Email',
              type: 'email',
              placeholder: 'Digite seu e-mail',
            },
            {
              name: 'password',
              label: 'Admin Senha',
              type: 'password',
              placeholder: 'Digite sua senha',
            },
          ]}
          values={formData}
          onFieldChange={handleChange}
          buttonText="Login"
          error={error}
        />
      </div>
    </div>
  );
};
