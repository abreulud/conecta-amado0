import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { AuthForm } from '../AuthForm';
import { LogoSection } from '../LogoSection';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userId = useTracker(() => Meteor.userId());
  const navigate = useNavigate();

  useEffect(() => {
    if (Meteor.userId() && localStorage.getItem('keepLoggedIn') === 'true') {
      navigate('/');
    }
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);
    Meteor.loginWithPassword(formData.email, formData.password, err => {
      setIsLoading(false);
      if (err) {
        let message = err.reason;
        switch (message) {
          case 'Something went wrong. Please check your credentials.':
            setError('Email ou senha incorretos');
            return;
          default:
            setError(message);
            return;
        }
      }

      if (formData.keepLoggedIn) {
        localStorage.setItem('keepLoggedIn', 'true');
      } else {
        localStorage.removeItem('keepLoggedIn');
      }
      navigate('/');
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-[#f9f4ef]">
      <nav className="flex justify-between items-center p-6">
        <LogoSection />
      </nav>
      <div className="flex min-h-screen items-center justify-center px-4 ">
        <div className="flex w-full max-w-6xl mb-32">
          <AuthForm
            title="Faça Login"
            subtitle="Entre e agende o seu serviço conosco!"
            step={0}
            onSubmit={handleSubmit}
            fields={[
              {
                name: 'email',
                label: 'Email',
                type: 'email',
                placeholder: 'Digite seu e-mail',
              },
              {
                name: 'password',
                label: 'Senha',
                type: 'password',
                placeholder: 'Digite sua senha',
              },
            ]}
            values={formData}
            onFieldChange={handleChange}
            buttonText="Login"
            footerText="Não tem uma conta?"
            footerLink={{ text: 'Registre-se', to: '/signup' }}
            keepLoggedInOption={true}
            forgotPasswordLink="/forgot-password"
            error={error}
          />

          <div className="hidden md:flex w-1/2 items-center justify-center p-8">
            <img
              src="../../assets/hug.svg"
              alt="Imagem"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
