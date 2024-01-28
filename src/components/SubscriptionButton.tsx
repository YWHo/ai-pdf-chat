"use client";
import React from "react";
import axios from "axios";
import { Button } from "./ui/button";

type Props = {
  isPro: boolean;
};

function SubscriptionButton({ isPro }: Props) {
  const [loading, setLoading] = React.useState(false);
  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (err) {
      console.error("SubscriptionButton:\n", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button disabled={loading} onClick={handleSubscription} variant="secondary">
      {isPro ? "Manage Subscriptions" : "Get Pro"}
    </Button>
  );
}

export default SubscriptionButton;
