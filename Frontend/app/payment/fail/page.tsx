"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentFailPage() {
  const router = useRouter();

  return (
    <div className="container py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-3xl font-bold text-foreground">Payment Failed</h1>
        <p className="text-muted-foreground">
          We couldn't process your payment. Please try again or contact support if the problem persists.
        </p>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => router.push("/pricing")}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
} 