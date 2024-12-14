import { IsLoggedIn } from '@autospace/ui/src/components/organisms/IsLoggedIn';
import { IsManager } from '@autospace/ui/src/components/organisms/IsManager';
import React from 'react';
import { ListGarageBookings } from '@autospace/ui/src/components/templates/ListGarageBookings';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const Bookings = async (props: { searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;

  const garageId = Number(searchParams['garageId']);

  return (
    <main>
      <IsLoggedIn>
        <IsManager>
          <ListGarageBookings garageId={garageId} />
        </IsManager>
      </IsLoggedIn>
    </main>
  );
};

export default Bookings;
