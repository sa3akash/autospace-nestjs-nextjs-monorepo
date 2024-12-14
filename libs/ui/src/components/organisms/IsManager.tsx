'use client';

import { MyCompanyDocument } from '@autospace/network/src/gql/generated';
import { useQuery } from '@apollo/client';
import { LoaderPanel } from '../molecules/Loader';
import { AlertSection } from '../molecules/AlertSection';
import { CreateCompany } from './CreateCompany';
import { ReactNode } from 'react';
import { signOut } from 'next-auth/react';

type RenderPropChild = (id: number) => ReactNode;

export const IsManager = ({
  children,
}: {
  children: RenderPropChild | ReactNode;
}) => {
  const { data, loading, error } = useQuery(MyCompanyDocument);

  if (error?.message.includes('jwt')) {
    signOut({ redirectTo: '/login' });
  }

  if (loading) {
    return <LoaderPanel text="Loading company..." />;
  }

  if (!data?.myCompany)
    return (
      <AlertSection>
        <div>You don&apos;t have a company yet.</div>
        <CreateCompany />
      </AlertSection>
    );

  return (
    <>
      {typeof children === 'function'
        ? (children as RenderPropChild)(data.myCompany.id)
        : children}
    </>
  );
};
