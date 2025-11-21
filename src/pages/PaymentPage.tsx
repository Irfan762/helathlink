import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { machines } from "@/data/machines";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [purchase, setPurchase] = useState<any>(null);

  const machine = machines.find((m) => m.id === id);

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!user || !id) return;
      
      try {
        const { data, error } = await supabase
          .from("purchases")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .eq("status", "pending_payment")
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast.error("Purchase not found");
          navigate("/machines");
          return;
        }
        setPurchase(data);
      } catch (error) {
        console.error("Error fetching purchase:", error);
        toast.error("Failed to load purchase details");
      }
    };

    fetchPurchase();
  }, [user, id, navigate]);

  if (!machine || !purchase) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("purchases")
        .update({ status: "paid" })
        .eq("id", purchase.id);

      if (error) throw error;

      toast.success("Payment successful!");
      navigate(`/payment-success?orderId=${purchase.id}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(`/machines/${machine.id}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-muted-foreground">Review your order and proceed to payment</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <img
                  src={machine.image}
                  alt={machine.machineName}
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{machine.machineName}</h2>
                  <p className="text-sm text-muted-foreground mb-1">{machine.type}</p>
                  <p className="text-sm text-muted-foreground">Condition: {machine.condition}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Machine Price</span>
                  <span className="font-medium">₹{machine.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-medium">₹0</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{machine.price.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Payment</h3>
                    <p className="text-sm text-muted-foreground">Your payment information is encrypted</p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? "Processing..." : `Pay ₹${machine.price.toLocaleString()} Now`}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By proceeding, you agree to our terms and conditions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
