import { Machine } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Calendar, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface MachineCardProps {
  machine: Machine;
}

const MachineCard = ({ machine }: MachineCardProps) => {
  const navigate = useNavigate();

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Excellent":
        return "bg-success text-success-foreground";
      case "Good":
        return "bg-primary text-primary-foreground";
      case "Fair":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={machine.image}
          alt={machine.machineName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        {!machine.availability && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Currently Unavailable
            </Badge>
          </div>
        )}
        <Badge className={cn("absolute top-2 right-2", getConditionColor(machine.condition))}>
          {machine.condition}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-1">
          <h3 className="font-bold text-lg">{machine.machineName}</h3>
          <p className="text-sm text-muted-foreground">{machine.type}</p>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {machine.description}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Purchase Price:</span>
            <span className="text-lg font-bold text-primary">₹{machine.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Rental from:</span>
            <span className="font-medium">₹{machine.rentalPricing.perDay}/day</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/machines/${machine.id}`)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
        {machine.availability && (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/machines/${machine.id}?action=buy`)}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Buy
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/machines/${machine.id}?action=rent`)}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Rent
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default MachineCard;
