import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Rental {
  id: string;
  machine_name: string;
  rental_duration: string;
  total_price: number;
  status: string;
  start_date?: string;
  admin_status?: string;
  user_name?: string;
  phone?: string;
  village_name?: string;
  booking_date?: string;
}

const Rentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRentals();
    }
  }, [user, isAdmin]);

  const fetchRentals = async () => {
    try {
      if (isAdmin) {
        // Admins see all actual rentals
        const { data, error } = await supabase
          .from("rentals")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setRentals(data || []);
      } else {
        // Users see their own rental requests
        const { data, error } = await supabase
          .from("rental_requests")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setRentals(data || []);
      }
    } catch (error) {
      console.error("Error fetching rentals:", error);
      toast.error("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  const updateRentalStatus = async (id: string, status: string) => {
    if (!isAdmin) {
      toast.error("Unauthorized: Only admins can update rental status");
      return;
    }
    try {
      const { error } = await supabase.from("rentals").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success(`Rental marked as ${status}`);
      fetchRentals();
    } catch (error) {
      console.error("Error updating rental:", error);
      toast.error("Failed to update rental");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{isAdmin ? "All Rentals" : "My Rental Requests"}</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Manage all active rentals" : "View your rental requests and their approval status"}
          </p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading rentals...</p>
          </div>
        ) : rentals.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">{isAdmin ? "No Active Rentals" : "No Rental Requests"}</h2>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "No active rentals at the moment." 
                : "You haven't submitted any rental requests yet."}
            </p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-6">
            {rentals.map((rental) => (
              <Card key={rental.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{rental.machine_name}</h2>
                      {isAdmin && rental.start_date && (
                        <p className="text-sm text-muted-foreground">
                          Started: {new Date(rental.start_date).toLocaleDateString()}
                        </p>
                      )}
                      {!isAdmin && rental.booking_date && (
                        <p className="text-sm text-muted-foreground">
                          Requested: {new Date(rental.booking_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isAdmin ? (
                        <Badge variant={rental.status === "ongoing" ? "default" : "secondary"}>
                          {rental.status}
                        </Badge>
                      ) : (
                        <>
                          {rental.admin_status === "pending" && (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Pending Approval
                            </Badge>
                          )}
                          {rental.admin_status === "approved" && (
                            <Badge variant="default" className="gap-1 bg-success">
                              <CheckCircle className="h-3 w-3" />
                              Approved
                            </Badge>
                          )}
                          {rental.admin_status === "rejected" && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Rejected
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {!isAdmin && rental.user_name && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm"><span className="font-medium">Name:</span> {rental.user_name}</p>
                      <p className="text-sm"><span className="font-medium">Phone:</span> {rental.phone}</p>
                      <p className="text-sm"><span className="font-medium">Location:</span> {rental.village_name}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{rental.rental_duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{rental.total_price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isAdmin && rental.status === "ongoing" && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateRentalStatus(rental.id, "completed")} 
                        className="flex-1"
                      >
                        Mark Completed
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => updateRentalStatus(rental.id, "returned")} 
                        className="flex-1"
                      >
                        Mark Returned
                      </Button>
                    </div>
                  )}
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
