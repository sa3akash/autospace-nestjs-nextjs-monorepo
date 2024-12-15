'use client';
import { IsLoggedIn } from '@autospace/ui/src/components/organisms/IsLoggedIn';
import { IsValet } from '@autospace/ui/src/components/organisms/IsValet';
import { ValetHome } from '@autospace/ui/src/components/templates/ValetHome';

export default function Home() {
  return (
    <main>
      <IsLoggedIn>
        {(companyId) => (
          <IsValet companyId={companyId}>
            <ValetHome />
          </IsValet>
        )}
      </IsLoggedIn>
    </main>
  );
}
