"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const [processingPayment, setProcessingPayment] = useState(false);
  const router = useRouter();

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
      setProcessingPayment(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to subscribe");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pricing/init-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();
      
      if (data.success && data.data.gateway_url) {
        // Redirect to SSL Commerz payment page
        window.location.href = data.data.gateway_url;
      } else {
        throw new Error(data.message || "Failed to initialize payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
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
              disabled={processingPayment}
            >
              {processingPayment ? "Processing..." : "Subscribe Now"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
} 