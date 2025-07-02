import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';
import { AuthForm } from '../AuthForm';
import { LogoSection } from '../LogoSection';

import {
  cityOptions,
  stateOptions,
  genderOptions,
  orientationOptions,
} from '../../../api/formOptions';

export const SignupPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    state: '',
    birthDate: '',
    gender: '',
    sexualOrientation: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    Accounts.createUser(
      {
        email: formData.email,
        password: formData.password,
        profile: {
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          birthDate: formData.birthDate,
          gender: formData.gender,
          sexualOrientation: formData.sexualOrientation,
        },
      },
      err => {
        setIsLoading(false);
        if (err) {
          let message = err.reason;
          switch (message) {
            case 'Password may not be empty':
              setError('Senha não pode estar vazia.');
              return;
            case 'Passwords do not match':
              setError('Senhas não são iguais.');
              return;
            case 'Need to set a username or email':
              setError('Email necessario');
              return;
            default:
              setError(message);
              return;
          }
        }
        navigate('/');
      }
    );
  };

  const stepFields =
    currentStep === 1
      ? [
          {
            required: true,
            name: 'name',
            label: 'Nome Completo',
            type: 'text',
            placeholder: 'Digite seu nome completo',
          },
          {
            required: true,
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'Digite seu e-mail',
          },
          {
            required: true,
            name: 'password',
            label: 'Senha',
            type: 'password',
            placeholder: 'Digite sua senha',
          },
          {
            required: true,
            name: 'confirmPassword',
            label: 'Confirmar senha',
            type: 'password',
            placeholder: 'Confirme sua senha',
          },
          {
            required: true,
            name: 'phone',
            label: 'Contato',
            type: 'select-phone',
            placeholder: '719823456789',
          },
        ]
      : [
          {
            required: true,
            name: 'state',
            label: 'Estado',
            type: 'select',
            options: stateOptions || [],
          },
          {
            required: true,
            name: 'city',
            label: 'Cidade',
            type: 'select',
            options: cityOptions || [],
          },
          {
            required: true,
            name: 'birthDate',
            label: 'Data de Nascimento',
            type: 'date',
            placeholder: '12/12/2020',
          },
          {
            required: true,
            name: 'gender',
            label: 'Gênero',
            type: 'select',
            options: genderOptions || [],
          },
          {
            required: true,
            name: 'sexualOrientation',
            label: 'Orientação Sexual',
            type: 'select',
            options: orientationOptions || [],
          },
        ];

  return (
    <div className="bg-[#f9f4ef]">
      <nav className="flex justify-between items-center p-6">
        <LogoSection />
      </nav>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex w-full max-w-6xl mb-32">
          <AuthForm
            greetings={true}
            title="Registre-se"
            subtitle="Preencha as informações"
            step={currentStep}
            setStep={setCurrentStep}
            onSubmit={handleSubmit}
            fields={stepFields}
            values={formData}
            onFieldChange={handleChange}
            buttonText={currentStep === 1 ? 'Avançar' : 'Registrar'}
            footerText="Já tem uma conta?"
            footerLink={{ text: 'Faça Login', to: '/login' }}
            error={error}
          />

          <div className="hidden md:flex w-1/2 items-center justify-center p-8">
            <img
              src="../../assets/family.svg"
              alt="Imagem"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
