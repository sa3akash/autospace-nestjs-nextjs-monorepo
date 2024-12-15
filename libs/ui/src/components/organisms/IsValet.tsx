'use client';
import { ValetMeDocument } from '@autospace/network/src/gql/generated';
import { useQuery } from '@apollo/client';
import { LoaderPanel } from '../molecules/Loader';
import { AlertSection } from '../molecules/AlertSection';
import { ReactNode } from 'react';
import { Button } from '../atoms/Button';
import { IconCopy } from '@tabler/icons-react';

type RenderPropChild = (companyId: number) => ReactNode;

export const IsValet = ({
  children,
  companyId,
}: {
  children: RenderPropChild | ReactNode;
  companyId: string;
}) => {
  const { data, loading } = useQuery(ValetMeDocument);

  if (loading) {
    return <LoaderPanel text="Loading company..." />;
  }

  if (!data?.valetMe?.companyId)
    return (
      <AlertSection>
        <div>You are not a valet.</div>
        <div>Please contact the company&apos;s managers with your ID. </div>
        <div>
          {companyId}
          <Button
            onClick={() => {
              navigator.clipboard.writeText(companyId);
              alert('ID copied to clipboard');
            }}
          >
            <IconCopy className="w-5" />
          </Button>
        </div>
      </AlertSection>
    );

  return (
    <>
      {typeof children === 'function'
        ? (children as RenderPropChild)(data.valetMe.companyId)
        : children}
    </>
  );
};
