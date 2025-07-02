import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';
import { AuthForm } from '../AuthForm';

export const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);
    email = formData.email;
    Accounts.forgotPassword({ email }, err => {
      setIsLoading(false);
      if (err) {
        setError(err.reason);
        return;
      }
      setMessage(`Password reset email sent to ${email}`);
      setError('');
      setTimeout(() => navigate('/login'), 3000);
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f4ef] px-4">
      <div className="flex w-full max-w-6xl">
        <AuthForm
          title="Recuperação de Senha"
          subtitle={
            message ||
            'Preencha o seu email para solicitar a recuperação de senha'
          }
          step={0}
          onSubmit={handleSubmit}
          fields={[
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              placeholder: 'Digite seu e-mail',
            },
          ]}
          values={formData}
          onFieldChange={handleChange}
          buttonText="Enviar"
          footerText="Lembrou sua senha?"
          footerLink={{ text: 'Faça Login?', to: '/login' }}
          error={error}
        />
      </div>
    </div>
  );
};
