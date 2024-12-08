import { TotalPrice } from '@autospace/utils/types';
import { CreateBookingInput } from 'src/models/bookings/graphql/dtos/create-booking.input';

export class CreateStripeDto {
  id: string;
  totalPriceObj: TotalPrice;
  bookingData: CreateBookingInput;
}
