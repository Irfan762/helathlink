import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user } = useAuth();
  const [purchase, setPurchase] = useState<any>(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!user || !orderId) return;
      
      try {
        const { data, error } = await supabase
          .from("purchases")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setPurchase(data);
      } catch (error) {
        console.error("Error fetching purchase:", error);
      }
    };

    fetchPurchase();
  }, [user, orderId]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-success">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Your order has been confirmed and will be processed shortly
              </p>
            </div>

            {purchase && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-center gap-3 pb-4 border-b">
                    <Package className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Order Details</h2>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono font-medium">{purchase.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Machine</span>
                      <span className="font-medium">{purchase.machine_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-bold text-primary">₹{purchase.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status</span>
                      <span className="font-medium text-success">Completed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/machines")}
              >
                Continue Shopping
              </Button>
              <Button 
                size="lg" 
                className="flex-1"
                onClick={() => navigate("/rentals")}
              >
                View My Orders
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              A confirmation email has been sent to your registered email address
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
