"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
  Edit,
  Package
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// interface ItemCardProps {
//   item: {
//     _id: Id<"list_items">;
//     name: string;
//     description?: string;
//     quantity: number;
//     unit?: string;
//     price?: number;
//     priority: "low" | "medium" | "high";
//     isCompleted: boolean;
//     category?: {
//       name: string;
//       color: string;
//       icon: string;
//     };
//   };
//   userId: Id<"users">;
// }
interface ItemCardProps {
  item: {
    _id: Id<"list_items">;
    name: string;
    description?: string;
    quantity: number;
    unit?: string;
    price?: number;
    priority: "low" | "medium" | "high";
    isCompleted: boolean;
    category?: {
      name: string;
      color: string;
      icon: string;
    } | null;
  };
  userId: Id<"users">;
}
const priorityConfig = {
  low: { color: "bg-emerald-100 text-emerald-800", label: "Low" },
  medium: { color: "bg-amber-100 text-amber-800", label: "Medium" },
  high: { color: "bg-red-100 text-red-800", label: "High" },
};

export function ItemCard({ item, userId }: ItemCardProps) {
  const [loading, setLoading] = useState(false);
  
  const updateItem = useMutation(api.listitems.updateItem);
  const deleteItem = useMutation(api.listitems.deleteItem);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      await updateItem({
        itemId: item._id,
        userId,
        isCompleted: !item.isCompleted,
      });
      toast.success(item.isCompleted ? "Item marked as pending" : "Item completed!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItem({
        itemId: item._id,
        userId,
      });
      toast.success("Item deleted");
    } catch (error) {
      console.log(error)
      toast.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn(
      "group bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-200",
      item.isCompleted && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleComplete}
            disabled={loading}
            className="p-0 h-auto hover:bg-transparent"
          >
            {item.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-medium text-gray-900 truncate",
                  item.isCompleted && "line-through text-gray-500"
                )}>
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Package className="w-3 h-3" />
                <span>{item.quantity}{item.unit && ` ${item.unit}`}</span>
              </div>

              {item.price && (
                <span className="text-sm font-medium text-gray-900">
                  ${item.price.toFixed(2)}
                </span>
              )}

              <Badge 
                className={cn("text-xs", priorityConfig[item.priority].color)}
                variant="secondary"
              >
                {priorityConfig[item.priority].label}
              </Badge>

              {item.category && (
                <Badge variant="outline" className="text-xs">
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: item.category.color }}
                  />
                  {item.category.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}