import { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import MachineCard from "@/components/MachineCard";
import { machines } from "@/data/machines";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Machines = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 70000]);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const categories = ["all", ...Array.from(new Set(machines.map((m) => m.category)))];
  const conditions = ["all", "Excellent", "Good", "Fair"];

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesSearch =
        machine.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === "all" || machine.category === categoryFilter;
      const matchesCondition = conditionFilter === "all" || machine.condition === conditionFilter;
      const matchesPrice = machine.price >= priceRange[0] && machine.price <= priceRange[1];
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && machine.availability) ||
        (availabilityFilter === "unavailable" && !machine.availability);

      return matchesSearch && matchesCategory && matchesCondition && matchesPrice && matchesAvailability;
    });
  }, [searchQuery, categoryFilter, conditionFilter, priceRange, availabilityFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Medical Equipment Catalog</h1>
          <p className="text-muted-foreground">Browse and filter our collection of refurbished medical devices</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {cond === "all" ? "All Conditions" : cond}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="pt-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={70000}
                    step={1000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Machines Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredMachines.length} of {machines.length} machines
                </span>
                {filteredMachines.length !== machines.length && (
                  <Badge variant="secondary">Filtered</Badge>
                )}
              </div>
            </div>

            {filteredMachines.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No machines found matching your filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMachines.map((machine) => (
                  <MachineCard key={machine.id} machine={machine} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Machines;
