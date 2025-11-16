import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RentalBooking } from "@/types";
import { toast } from "sonner";
import { Calendar, Phone, MapPin, Package, CheckCircle, Clock } from "lucide-react";

const Rentals = () => {
  const [bookings, setBookings] = useState<RentalBooking[]>([]);

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem("rentalBookings") || "[]");
    setBookings(storedBookings);
  }, []);

  const updateBookingStatus = (id: string, status: RentalBooking["status"]) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === id ? { ...booking, status } : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem("rentalBookings", JSON.stringify(updatedBookings));
    toast.success(`Booking status updated to ${status}`);
  };

  const getStatusColor = (status: RentalBooking["status"]) => {
    switch (status) {
      case "ongoing":
        return "bg-primary text-primary-foreground";
      case "completed":
        return "bg-success text-success-foreground";
      case "returned":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: RentalBooking["status"]) => {
    switch (status) {
      case "ongoing":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "returned":
        return <Package className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Rental Bookings</h1>
          <p className="text-muted-foreground">Manage all your equipment rental bookings</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No rental bookings yet</p>
              <p className="text-muted-foreground mb-4">Start by browsing our equipment catalog</p>
              <Button onClick={() => (window.location.href = "/machines")}>Browse Machines</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{booking.machineName}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Booking ID: {booking.id}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Contact:</span>
                        <span>{booking.userName} - {booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>{booking.villageName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Duration:</span>
                        <span>{booking.rentalDuration.replace("-", " ")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Booked On:</span>
                        <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">₹{booking.totalPrice.toLocaleString()}</p>
                      </div>

                      <div className="flex gap-2">
                        {booking.status === "ongoing" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, "completed")}
                              className="flex-1"
                            >
                              Mark Completed
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, "returned")}
                              className="flex-1"
                            >
                              Mark Returned
                            </Button>
                          </>
                        )}
                        {booking.status === "completed" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, "returned")}
                            className="w-full"
                          >
                            Mark as Returned
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rentals;
