export interface Machine {
  id: string;
  machineName: string;
  type: string;
  category: string;
  condition: "Excellent" | "Good" | "Fair";
  description: string;
  price: number;
  image: string;
  availability: boolean;
  repairHistory: string[];
  sparePartsReplaced: string[];
  warrantyInfo: string;
  rentalPricing: {
    perDay: number;
    perWeek: number;
    perMonth: number;
  };
}

export interface RentalBooking {
  id: string;
  machineId: string;
  machineName: string;
  userName: string;
  phone: string;
  villageName: string;
  rentalDuration: string;
  totalPrice: number;
  status: "ongoing" | "completed" | "returned";
  bookingDate: string;
}
