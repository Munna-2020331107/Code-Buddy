"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="container py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto" />
        <h1 className="text-3xl font-bold text-foreground">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment was cancelled. You can try again whenever you're ready.
        </p>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => router.push("/pricing")}>
            Back to Pricing
          </Button>
          <Button onClick={() => router.push("/")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 