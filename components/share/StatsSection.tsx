// components/StatsSection.jsx
import {
  ListChecks,
  PackageCheck,
  ClipboardList,
  PiggyBank,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    label: "Total Lists",
    value: 12,
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Active Items",
    value: 42,
    icon: ListChecks,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    label: "Completed",
    value: 105,
    icon: PackageCheck,
    color: "bg-green-100 text-green-600",
  },
  {
    label: "Money Saved",
    value: "$320",
    icon: PiggyBank,
    color: "bg-rose-100 text-rose-600",
  },
];

export default function StatsSection() {
  return (
    <section className="my-20 px-4 md:px-8 lg:px-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">📊 Your Stats</h2>
        <Badge variant="outline" className="text-sm px-3 py-1">
          This Month
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-xl transition duration-300 rounded-2xl border border-gray-200 bg-white"
            >
              <CardHeader className="flex items-center justify-between p-4">
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-sm text-gray-500">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-5">
                <div className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
