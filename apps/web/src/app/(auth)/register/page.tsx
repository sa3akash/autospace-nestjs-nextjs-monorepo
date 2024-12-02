import React from 'react';
import { RegisterForm } from '@autospace/ui/src/components/templates/RegisterForm';
import { AuthLayout } from '@autospace/ui/src/components/molecules/AuthLayout';

const Register = () => {
  return (
    <AuthLayout title="Register">
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
