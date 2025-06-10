"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // You can add additional verification here if needed
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Thank you for your subscription. You will be redirected to the dashboard shortly.
        </p>
        <Button onClick={() => router.push("/")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
} 