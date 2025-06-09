"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  duration: string;
  savings?: string;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pricing/plans`);
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      toast.error("Failed to fetch pricing plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to subscribe");
        return;
      }

      // Here you would integrate with Amarpay
      // For now, we'll just simulate the payment
      const paymentId = "simulated_payment_" + Date.now();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pricing/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId, paymentId }),
      });

      if (response.ok) {
        toast.success("Subscription successful!");
      } else {
        throw new Error("Subscription failed");
      }
    } catch (error) {
      toast.error("Failed to process subscription");
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">
          Select the perfect plan for your coding journey
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 relative ${
              selectedPlan === plan.id ? "border-primary" : ""
            }`}
          >
            {plan.savings && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                  {plan.savings}
                </span>
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-2">
                ${plan.price}
                <span className="text-lg text-muted-foreground">/{plan.duration}</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={selectedPlan === plan.id ? "default" : "outline"}
              onClick={() => {
                setSelectedPlan(plan.id);
                handleSubscribe(plan.id);
              }}
            >
              Subscribe Now
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
} 