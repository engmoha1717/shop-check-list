// components/FeaturesSection.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, DollarSign, Star, Zap } from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Smart Lists",
    desc: "Prioritize what matters. Manage shopping by urgency, categories, or reminders.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: DollarSign,
    title: "Track Budget",
    desc: "Stay within budget. Monitor spending and discover ways to save more.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Star,
    title: "Favorites",
    desc: "Pin your go-to items. Save time with one-tap access to frequent purchases.",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: Zap,
    title: "Quick Add",
    desc: "Speed matters. Add any item with one tap, voice, or barcode scan.",
    color: "bg-rose-100 text-rose-600",
  },
];

export default function FeaturesSection() {
  return (
    <section className="my-20 px-4 md:px-8 lg:px-16">
      <h2 className="text-center text-3xl sm:text-4xl font-bold mb-12 text-gray-900">
        🚀 Why You&aps;ll Love It
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card
              key={idx}
              className="transition duration-300 transform hover:-translate-y-1 hover:shadow-xl bg-white border border-gray-100 rounded-2xl"
            >
              <CardHeader className="flex flex-col items-center text-center pt-6">
                <div className={`p-3 rounded-full ${feature.color} mb-2`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 px-6 pb-6 text-center">
                {feature.desc}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
