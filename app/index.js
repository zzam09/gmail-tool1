"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Index() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    
    if (session) {
      window.location.href = '/app';
    } else {
      window.location.href = '/landing';
    }
  }, [session, status]);

  return (
    <div style={{
      height: "100dvh", display: "flex", alignItems: "center", 
      justifyContent: "center", background: "#f2f2f7",
      fontFamily: "-apple-system, BlinkMacSystemFont, system-ui",
    }}>
      <div style={{ color: "#6e6e73", fontSize: 14 }}>Loading...</div>
    </div>
  );
}
