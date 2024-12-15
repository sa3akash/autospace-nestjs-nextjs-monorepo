'use client';
import { IsLoggedIn } from '@autospace/ui/src/components/organisms/IsLoggedIn';
import { IsValet } from '@autospace/ui/src/components/organisms/IsValet';
import { ValetTrips } from '@autospace/ui/src/components/templates/ValetTrips';

export default function Page() {
  return (
    <main>
      <IsLoggedIn>
        {(id) => (
          <IsValet companyId={id}>
            <ValetTrips id={id} />
          </IsValet>
        )}
      </IsLoggedIn>
    </main>
  );
}
