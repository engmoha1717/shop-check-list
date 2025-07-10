"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShoppingCart, 
  Plus, 
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface WelcomeFlowProps {
  userId: Id<"users">;
  onComplete: () => void;
}

export function WelcomeFlow({ userId, onComplete }: WelcomeFlowProps) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const createList = useMutation(api.shoppinglists.createList);

  const handleCreateFirstList = async () => {
    if (!listName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    setLoading(true);
    try {
      await createList({
        userId,
        name: listName.trim(),
        description: listDescription.trim() || undefined,
        priority: "medium",
        color: "#10B981",
      });

      toast.success("Your first shopping list created! 🎉");
      onComplete();
    } catch (error) {
        console.log(error)
      toast.error("Failed to create list");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to ShopList! 👋
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Hi {user?.firstName}! Let&aposs;s get you started with your first shopping list.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-800">Never forget items again</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">Organize by categories</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Plus className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-800">Track prices and quantities</span>
              </div>
            </div>
            
            <Button 
              onClick={() => setStep(2)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              Create My First List
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-gray-900">
            Create Your First Shopping List
          </CardTitle>
          <p className="text-gray-600">
            Give your list a name and you&aposs;re ready to start shopping!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listName">List Name *</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., Weekly Groceries, Party Supplies"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="listDescription">Description (Optional)</Label>
            <Textarea
              id="listDescription"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              placeholder="Any notes about this shopping trip..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleCreateFirstList}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Creating..." : "Create List"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}