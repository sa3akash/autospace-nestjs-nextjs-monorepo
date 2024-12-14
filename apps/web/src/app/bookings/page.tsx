import { ListCustomerBookings } from '@autospace/ui/src/components/templates/ListCustomerBookings'
import { IsLoggedIn } from '@autospace/ui/src/components/organisms/IsLoggedIn'
const BookingsPage = () => {
  return (
    <IsLoggedIn>
    <ListCustomerBookings />
  </IsLoggedIn>
);
};

export default BookingsPage;
