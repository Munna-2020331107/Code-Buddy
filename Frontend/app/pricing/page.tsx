"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Gauge, PlayCircle, Image, Users, CalendarCheck } from "lucide-react";
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
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to subscribe");
      router.push("/sign-in");
      return;
    }
    try {
      setProcessingPayment(true);
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

  function getUsageLimits(planName: string) {
    if (planName.toLowerCase().includes("monthly")) {
      return [
        { icon: <PlayCircle className="h-6 w-6 text-primary" />, text: "Code Execution: Up to 80 runs per month" },
        { icon: <Image className="h-6 w-6 text-primary" />, text: "Image Code Identifier: Analyze up to 50 images per month" },
        { icon: <Users className="h-6 w-6 text-primary" />, text: "Code Collaboration: Collaborate on up to 50 sessions per month" },
        { icon: <CalendarCheck className="h-6 w-6 text-primary" />, text: "Custom Learning Schedule: Create up to 20 schedules per month" },
      ];
    }
    if (planName.toLowerCase().includes("quarter")) {
      return [
        { icon: <PlayCircle className="h-6 w-6 text-primary" />, text: "Code Execution: Up to 350 runs per quarter" },
        { icon: <Image className="h-6 w-6 text-primary" />, text: "Image Code Identifier: Analyze up to 220 images per quarter" },
        { icon: <Users className="h-6 w-6 text-primary" />, text: "Code Collaboration: Collaborate on up to 220 sessions per quarter" },
        { icon: <CalendarCheck className="h-6 w-6 text-primary" />, text: "Custom Learning Schedule: Create up to 100 schedules per quarter" },
      ];
    }
    if (planName.toLowerCase().includes("year")) {
      return [
        { icon: <PlayCircle className="h-6 w-6 text-primary" />, text: "Code Execution: Up to 1,100 runs per year" },
        { icon: <Image className="h-6 w-6 text-primary" />, text: "Image Code Identifier: Analyze up to 700 images per year" },
        { icon: <Users className="h-6 w-6 text-primary" />, text: "Code Collaboration: Collaborate on up to 700 sessions per year" },
        { icon: <CalendarCheck className="h-6 w-6 text-primary" />, text: "Custom Learning Schedule: Create up to 450 schedules per year" },
      ];
    }
    return [];
  }

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
            <div className="mb-4">
              <h4 className="font-semibold text-base mb-2 text-primary">Usage Limits</h4>
              <ul className="space-y-2 bg-muted/40 rounded-md p-3 mb-4">
                {getUsageLimits(plan.name).map((limit, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-lg font-semibold text-muted-foreground">
                    {limit.icon}
                    <span>{limit.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              style={{ fontSize: "1.15rem", paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
              className="w-full text-lg py-3"
              variant={selectedPlan === plan.id ? "default" : "outline"}
              onClick={() => {
                setSelectedPlan(plan.id);
                handleSubscribe(plan.id);
              }}
              disabled={processingPayment || !localStorage.getItem("token")}
            >
              {processingPayment ? "Processing..." : "Subscribe Now"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
} 