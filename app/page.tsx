// import HeroSection from "@/components/share/HeroSection"
// import FeaturesSection from "@/components/share/FeaturesSection"
// import StatsSection from "@/components/share/StatsSection"
// export default function Home() {
//   return (
//     <main className="container max-w-7xl mx-auto px-4 py-10">
//     <HeroSection />
//     <FeaturesSection />
//     <StatsSection />
//   </main>
//   );
// }




 
"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";


import { redirect } from "next/navigation";
import  LoadingSpinner  from "@/components/spinner";

export default function Home() {
  const { user, isLoaded } = useUser();


  useEffect(() => {
    if (isLoaded && user) {
     
      redirect("/dashboard");
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    // If no user, redirect to Clerk's sign-in page
    // If not logged in, redirect to sign-in
    redirect("/(auth)sign-in");
  }

  // This loading state shows while redirecting to dashboard
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
 