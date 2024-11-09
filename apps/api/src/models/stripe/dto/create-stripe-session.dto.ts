// import { TotalPrice } from '@autospace/util/types'
import { CreateBookingInput } from 'src/models/bookings/graphql/dtos/create-booking.input';

export class CreateStripeDto {
  id: string;
  // totalPriceObj: TotalPrice
  totalPriceObj: any;
  bookingData: CreateBookingInput;
}
