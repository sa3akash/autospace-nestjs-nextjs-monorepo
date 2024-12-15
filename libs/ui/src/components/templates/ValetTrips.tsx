import { useState } from 'react';
import { Tab, TabPanel, Tabs } from '../molecules/Tabs';
import { ShowValetMyPickupTrips } from '../organisms/ShowValetMyPickupTrips';
import { ShowValetMyDropTrips } from '../organisms/ShowValetMyDropTrips';

export const ValetTrips = ({ id }: { id: string }) => {
  const [value, setValue] = useState<0 | 1>(0);

  return (
    <>
      <Tabs
        value={value}
        onChange={(e, v) => setValue(v)}
        aria-label="bookings"
      >
        <Tab label={'Pickup'} />
        <Tab label={'Drop'} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <ShowValetMyPickupTrips id={id} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ShowValetMyDropTrips id={id} />
      </TabPanel>
    </>
  );
};
