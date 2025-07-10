"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,

  Package,
  DollarSign,

  Eye
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ListCardProps {
  list: {
    _id: string | import("@/convex/_generated/dataModel").Id<"shopping_lists">;
    name: string;
    description?: string;
    priority: "low" | "medium" | "high";
    scheduledDate?: number;
    color?: string;
    itemCount: number;
    completedCount: number;
    totalPrice: number;
    createdAt: number;
    _creationTime?: number;
    userId?: import("@/convex/_generated/dataModel").Id<"users">;
    isCompleted?: boolean;
    updatedAt?: number;
    completedAt?: number;
  };
}

const priorityConfig = {
  low: { color: "bg-emerald-100 text-emerald-800", label: "Low" },
  medium: { color: "bg-amber-100 text-amber-800", label: "Medium" },
  high: { color: "bg-red-100 text-red-800", label: "High" },
};

export function ListCard({ list }: ListCardProps) {
  const completionPercentage = list.itemCount > 0 
    ? Math.round((list.completedCount / list.itemCount) * 100) 
    : 0;

  const isScheduledToday = list.scheduledDate && 
    new Date(list.scheduledDate).toDateString() === new Date().toDateString();

  return (
    <Card className="group bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {list.name}
            </h3>
            {list.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {list.description}
              </p>
            )}
          </div>
          <div className="flex gap-2 ml-2">
            <Badge 
              className={cn("text-xs", priorityConfig[list.priority].color)}
              variant="secondary"
            >
              {priorityConfig[list.priority].label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">
              {list.completedCount}/{list.itemCount} items
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ 
                width: `${completionPercentage}%`,
                backgroundColor: list.color || "#10B981"
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Package className="w-4 h-4" />
            <span>{list.itemCount} items</span>
          </div>
          {list.totalPrice > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>${list.totalPrice.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Scheduled Date */}
        {list.scheduledDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {isScheduledToday ? "Today" : format(new Date(list.scheduledDate), "MMM d, yyyy")}
            </span>
            {isScheduledToday && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                Today
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            asChild 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Link href={`/lists/${list._id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View List
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}