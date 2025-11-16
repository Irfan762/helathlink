import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { machines as initialMachines } from "@/data/machines";
import { Machine } from "@/types";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package } from "lucide-react";

const Admin = () => {
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState<Partial<Machine>>({
    machineName: "",
    type: "",
    category: "",
    condition: "Good",
    description: "",
    price: 0,
    image: "",
    availability: true,
    repairHistory: [],
    sparePartsReplaced: [],
    warrantyInfo: "",
    rentalPricing: { perDay: 0, perWeek: 0, perMonth: 0 },
  });

  useEffect(() => {
    const stored = localStorage.getItem("adminMachines");
    if (stored) {
      setMachines(JSON.parse(stored));
    }
  }, []);

  const saveMachines = (updatedMachines: Machine[]) => {
    setMachines(updatedMachines);
    localStorage.setItem("adminMachines", JSON.stringify(updatedMachines));
  };

  const handleSubmit = () => {
    if (!formData.machineName || !formData.type || !formData.category || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }

    if (editingMachine) {
      const updatedMachines = machines.map((m) =>
        m.id === editingMachine.id ? { ...formData, id: editingMachine.id } as Machine : m
      );
      saveMachines(updatedMachines);
      toast.success("Machine updated successfully");
    } else {
      const newMachine: Machine = {
        ...formData,
        id: Date.now().toString(),
        repairHistory: formData.repairHistory || [],
        sparePartsReplaced: formData.sparePartsReplaced || [],
      } as Machine;
      saveMachines([...machines, newMachine]);
      toast.success("Machine added successfully");
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData(machine);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    const updatedMachines = machines.filter((m) => m.id !== id);
    saveMachines(updatedMachines);
    toast.success("Machine deleted successfully");
  };

  const resetForm = () => {
    setEditingMachine(null);
    setFormData({
      machineName: "",
      type: "",
      category: "",
      condition: "Good",
      description: "",
      price: 0,
      image: "",
      availability: true,
      repairHistory: [],
      sparePartsReplaced: [],
      warrantyInfo: "",
      rentalPricing: { perDay: 0, perWeek: 0, perMonth: 0 },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your medical equipment inventory</p>
          </div>
          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Machine
          </Button>
        </div>

        <div className="grid gap-4">
          {machines.map((machine) => (
            <Card key={machine.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <img
                    src={machine.image}
                    alt={machine.machineName}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{machine.machineName}</h3>
                        <p className="text-sm text-muted-foreground">{machine.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={machine.availability ? "default" : "secondary"}>
                          {machine.availability ? "Available" : "Unavailable"}
                        </Badge>
                        <Badge className={
                          machine.condition === "Excellent" ? "bg-success" :
                          machine.condition === "Good" ? "bg-primary" : "bg-secondary"
                        }>
                          {machine.condition}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{machine.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-4 text-sm">
                        <span className="font-medium">Price: ₹{machine.price.toLocaleString()}</span>
                        <span className="text-muted-foreground">
                          Rental: ₹{machine.rentalPricing.perDay}/day
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(machine)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(machine.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMachine ? "Edit Machine" : "Add New Machine"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Machine Name *</Label>
                <Input
                  value={formData.machineName}
                  onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                  placeholder="e.g., Digital X-Ray Machine"
                />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Imaging Equipment"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Radiology"
                />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: any) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the machine"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rental Pricing (₹)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Per Day"
                  value={formData.rentalPricing?.perDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rentalPricing: { ...formData.rentalPricing!, perDay: parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Per Week"
                  value={formData.rentalPricing?.perWeek}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rentalPricing: { ...formData.rentalPricing!, perWeek: parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Per Month"
                  value={formData.rentalPricing?.perMonth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rentalPricing: { ...formData.rentalPricing!, perMonth: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Warranty Info</Label>
              <Input
                value={formData.warrantyInfo}
                onChange={(e) => setFormData({ ...formData, warrantyInfo: e.target.value })}
                placeholder="e.g., 12 months comprehensive warranty"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="availability"
                checked={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="availability">Available for purchase/rent</Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {editingMachine ? "Update Machine" : "Add Machine"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
