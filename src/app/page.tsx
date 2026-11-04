import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Filter, PieChart, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-full pb-20">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-14 max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#2d5a37] via-[#356740] to-[#204028] text-white p-8 sm:p-14 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur-md text-[#d8e8ce]">
              🌿 Eco-Smart Financial Tracker
            </span>
            <h1
              data-testid="home-title"
              className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]"
            >
              SpendWise
            </h1>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
              Take mindful control of your daily financial habits with an elegant, eco-themed expense tracker designed for simplicity and peace of mind.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link href="/expenses">
                <Button className="rounded-full bg-[#d8e8ce] text-[#1c2e22] hover:bg-[#c5dbb8] font-bold px-7 h-12 shadow-md">
                  Get Started <ArrowUpRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative ambient background blur */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#82ab78]/25 blur-3xl pointer-events-none" />
          <div className="absolute right-10 top-10 w-64 h-64 rounded-full bg-[#fbfbf7]/10 blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#5a705e]">
            Thoughtfully Crafted Features
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1c2e22]">
            Simpler insights, healthier decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[1.75rem] border-[#e3ebd9] bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e9f2e4] flex items-center justify-center text-[#2d5a37]">
                <DollarSign className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold text-[#1c2e22]">
                Add expenses
              </CardTitle>
              <CardDescription className="text-sm text-[#5a705e] leading-relaxed">
                Seamlessly log expenditures with categories, dates, and short memos in seconds.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-[1.75rem] border-[#e3ebd9] bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e9f2e4] flex items-center justify-center text-[#2d5a37]">
                <Filter className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold text-[#1c2e22]">
                Filter by month
              </CardTitle>
              <CardDescription className="text-sm text-[#5a705e] leading-relaxed">
                Effortlessly segment your entries by specific periods and category combinations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-[1.75rem] border-[#e3ebd9] bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e9f2e4] flex items-center justify-center text-[#2d5a37]">
                <PieChart className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold text-[#1c2e22]">
                See where money goes
              </CardTitle>
              <CardDescription className="text-sm text-[#5a705e] leading-relaxed">
                Gain clarity on top spending habits through dynamic real-time summaries and breakdowns.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
