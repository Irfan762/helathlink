import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { machines } from "@/data/machines";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart, Calendar, Shield, Wrench, Package, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const MachineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const [showRentalDialog, setShowRentalDialog] = useState(false);
  const [showRentNowDialog, setShowRentNowDialog] = useState(false);
  const [rentalDuration, setRentalDuration] = useState("");
  const [rentalForm, setRentalForm] = useState({
    userName: "",
    phone: "",
    villageName: "",
  });
  const [rentalRequest, setRentalRequest] = useState<any>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);

  const machine = machines.find((m) => m.id === id);

  // Check if user has an existing rental request for this machine
  useEffect(() => {
    const checkRentalRequest = async () => {
      if (!user || !machine) return;
      
      try {
        const { data, error } = await supabase
          .from("rental_requests")
          .select("*")
          .eq("user_id", user.id)
          .eq("machine_id", machine.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setRentalRequest(data);
      } catch (error) {
        console.error("Error checking rental request:", error);
      } finally {
        setLoadingRequest(false);
      }
    };

    checkRentalRequest();
  }, [user, machine]);

  useEffect(() => {
    if (searchParams.get("action") === "rent") {
      setShowRentalDialog(true);
    }
  }, [searchParams]);

  if (!machine) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Machine not found</h1>
          <Button onClick={() => navigate("/machines")}>Back to Machines</Button>
        </div>
      </div>
    );
  }

  const calculateRentalPrice = () => {
    if (!rentalDuration) return 0;
    const [amount, unit] = rentalDuration.split("-");
    const num = parseInt(amount);
    switch (unit) {
      case "day":
        return num * machine.rentalPricing.perDay;
      case "week":
        return num * machine.rentalPricing.perWeek;
      case "month":
        return num * machine.rentalPricing.perMonth;
      default:
        return 0;
    }
  };

  const handleBuy = async () => {
    if (!user) {
      toast.error("You must be logged in to make a purchase");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("purchases")
        .insert({
          user_id: user.id,
          machine_id: machine.id,
          machine_name: machine.machineName,
          price: machine.price,
          status: "pending_payment",
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/payment/${data.id}`);
    } catch (error) {
      console.error("Error creating purchase:", error);
      toast.error("Failed to initiate purchase. Please try again.");
    }
  };

  const handleRentalRequestSubmit = async () => {
    if (!rentalForm.userName || !rentalForm.phone || !rentalForm.villageName || !rentalDuration) {
      toast.error("Please fill all fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to make a rental request");
      return;
    }

    try {
      const { error } = await supabase
        .from("rental_requests")
        .insert({
          user_id: user.id,
          machine_id: machine.id,
          machine_name: machine.machineName,
          user_name: rentalForm.userName,
          phone: rentalForm.phone,
          village_name: rentalForm.villageName,
          rental_duration: rentalDuration,
          total_price: calculateRentalPrice(),
          admin_status: "pending",
        });

      if (error) throw error;

      toast.success("Rental request submitted!", {
        description: `Your request is pending admin approval.`,
      });

      setShowRentalDialog(false);
      // Refresh the request status
      const { data } = await supabase
        .from("rental_requests")
        .select("*")
        .eq("user_id", user.id)
        .eq("machine_id", machine.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setRentalRequest(data);
    } catch (error) {
      console.error("Error creating rental request:", error);
      toast.error("Failed to create request. Please try again.");
    }
  };

  const handleRentNow = async () => {
    if (!user || !rentalRequest) {
      toast.error("Invalid rental request");
      return;
    }

    try {
      const { error } = await supabase
        .from("rentals")
        .insert({
          user_id: user.id,
          machine_id: machine.id,
          machine_name: machine.machineName,
          rental_duration: rentalRequest.rental_duration,
          total_price: rentalRequest.total_price,
          status: "ongoing",
        });

      if (error) throw error;

      toast.success("Rental confirmed!", {
        description: `Your rental has been activated.`,
      });

      setShowRentNowDialog(false);
      setTimeout(() => navigate("/rentals"), 2000);
    } catch (error) {
      console.error("Error creating rental:", error);
      toast.error("Failed to confirm rental. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/machines")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Machines
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src={machine.image}
                alt={machine.machineName}
                className="w-full h-[500px] object-cover"
              />
              {!machine.availability && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Currently Unavailable
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-4xl font-bold">{machine.machineName}</h1>
                <Badge
                  className={
                    machine.condition === "Excellent"
                      ? "bg-success text-success-foreground"
                      : machine.condition === "Good"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }
                >
                  {machine.condition}
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground">{machine.type}</p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-2">Description</h2>
              <p className="text-muted-foreground">{machine.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Purchase Price</h3>
                <p className="text-3xl font-bold text-primary">₹{machine.price.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Rental Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Per Day</p>
                      <p className="text-lg font-bold">₹{machine.rentalPricing.perDay}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Per Week</p>
                      <p className="text-lg font-bold">₹{machine.rentalPricing.perWeek}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Per Month</p>
                      <p className="text-lg font-bold">₹{machine.rentalPricing.perMonth}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {machine.availability && (
              <div className="space-y-3 pt-4">
                <Button size="lg" className="w-full" onClick={handleBuy}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>

                {!isAdmin && (
                  <>
                    {loadingRequest ? (
                      <Button size="lg" variant="secondary" className="w-full" disabled>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Loading...
                      </Button>
                    ) : !rentalRequest ? (
                      <Button size="lg" variant="secondary" className="w-full" onClick={() => setShowRentalDialog(true)}>
                        <Calendar className="h-5 w-5 mr-2" />
                        Request Rental
                      </Button>
                    ) : rentalRequest.admin_status === "pending" ? (
                      <Button size="lg" variant="outline" className="w-full" disabled>
                        <Clock className="h-5 w-5 mr-2" />
                        Request Pending Approval
                      </Button>
                    ) : rentalRequest.admin_status === "approved" ? (
                      <Button size="lg" variant="default" className="w-full" onClick={() => setShowRentNowDialog(true)}>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Rent Now (Approved)
                      </Button>
                    ) : (
                      <Button size="lg" variant="destructive" className="w-full" disabled>
                        <XCircle className="h-5 w-5 mr-2" />
                        Request Rejected
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Repair History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {machine.repairHistory.map((repair, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {repair}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-secondary" />
                Spare Parts Replaced
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {machine.sparePartsReplaced.map((part, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {part}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Warranty Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{machine.warrantyInfo}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rental Dialog */}
      <Dialog open={showRentalDialog} onOpenChange={setShowRentalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rent {machine.machineName}</DialogTitle>
            <DialogDescription>Fill in your details to complete the rental booking</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                value={rentalForm.userName}
                onChange={(e) => setRentalForm({ ...rentalForm, userName: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={rentalForm.phone}
                onChange={(e) => setRentalForm({ ...rentalForm, phone: e.target.value })}
                placeholder="Enter your phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="villageName">Village/City Name</Label>
              <Input
                id="villageName"
                value={rentalForm.villageName}
                onChange={(e) => setRentalForm({ ...rentalForm, villageName: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <Label>Rental Duration</Label>
              <Select value={rentalDuration} onValueChange={setRentalDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-day">1 Day</SelectItem>
                  <SelectItem value="3-day">3 Days</SelectItem>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="2-week">2 Weeks</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="3-month">3 Months</SelectItem>
                  <SelectItem value="6-month">6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {rentalDuration && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-2xl font-bold text-primary">₹{calculateRentalPrice().toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowRentalDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleRentalRequestSubmit} className="flex-1">
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MachineDetails;
