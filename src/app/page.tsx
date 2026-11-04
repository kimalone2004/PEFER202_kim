import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Filter, PieChart } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center space-y-4 mb-12">
        <h1 data-testid="home-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          SpendWise
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A simple and powerful application to record your spending and see where your money goes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <DollarSign className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Add expenses</CardTitle>
            <CardDescription>
              Quickly record your daily spending with exact categories and notes.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Filter className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Filter by month</CardTitle>
            <CardDescription>
              Filter records easily by specific category and month seamlessly.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <PieChart className="w-8 h-8 text-primary mb-2" />
            <CardTitle>See where money goes</CardTitle>
            <CardDescription>
              Detailed breakdown of your spending habits and category totals.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
