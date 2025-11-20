import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Phone, MapPin, Package, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface RentalBooking {
  id: string;
  machine_id: string;
  machine_name: string;
  user_name: string;
  phone: string;
  village_name: string;
  rental_duration: string;
  total_price: number;
  status: "ongoing" | "completed" | "returned";
  booking_date: string;
}

const Rentals = () => {
  const { user, userRole, isAdmin } = useAuth();
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user, isAdmin]);

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from("rental_requests").select("*");
      
      // Admin can see all bookings, clinic users see only their own
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      setBookings((data || []) as RentalBooking[]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: RentalBooking["status"]) => {
    // Security check: only admins can update booking status
    if (!isAdmin) {
      toast.error("Unauthorized: Only admins can update booking status");
      return;
    }

    try {
      const { error } = await supabase
        .from("rental_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );

      toast.success(`Booking status updated to ${status}`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Rental Bookings</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Manage all rental bookings" : "Manage your equipment rental bookings"}
          </p>
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
                    <CardTitle className="text-xl">{booking.machine_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Booking ID: {booking.id.slice(0, 8)}
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
                        <span>{booking.user_name} - {booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>{booking.village_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Duration:</span>
                        <span>{booking.rental_duration.replace("-", " ")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Booked On:</span>
                        <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">₹{booking.total_price.toLocaleString()}</p>
                      </div>

                      {isAdmin && (
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
                      )}
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
