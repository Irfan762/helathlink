import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import MachineCard from "@/components/MachineCard";
import { machines } from "@/data/machines";
import { Activity, Shield, Zap, Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const featuredMachines = machines.filter((m) => m.availability).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">
              Premium Refurbished <span className="text-primary">Medical Equipment</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Affordable, certified, and reliable medical equipment for clinics, hospitals, and healthcare providers across India.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => navigate("/machines")}>
                Browse Equipment
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/machines?filter=rental")}>
                Explore Rentals
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Certified Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All equipment thoroughly inspected and certified
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Quick shipping and installation support
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Flexible Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Daily, weekly, or monthly rental options available
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Activity className="h-10 w-10 text-success mb-2" />
                <CardTitle>Full Warranty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive warranty on all purchases
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Machines */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Equipment</h2>
            <p className="text-muted-foreground">Explore our most popular medical devices</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredMachines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button onClick={() => navigate("/machines")} variant="outline" size="lg">
              View All Equipment
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Need Equipment for Your Clinic?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Whether you need to buy or rent, we have flexible options to suit your healthcare facility's needs.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/machines")}>
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
