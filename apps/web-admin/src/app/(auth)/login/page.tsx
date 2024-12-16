import React from 'react';
import { LoginForm } from '@autospace/ui/src/components/templates/LoginForm';
import { AuthLayout } from '@autospace/ui/src/components/molecules/AuthLayout';

const Login = () => {
  return (
    <AuthLayout title="Login" showSocial={false}>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
