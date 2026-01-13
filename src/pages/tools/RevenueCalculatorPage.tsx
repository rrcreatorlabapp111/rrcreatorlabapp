import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award, Calculator, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface Revenue {
  dailyEarnings: string;
  monthlyEarnings: string;
  yearlyEarnings: string;
  rpm: string;
}

export const RevenueCalculatorPage = () => {
  const navigate = useNavigate();
  const [views, setViews] = useState("");
  const [cpm, setCpm] = useState([3]);
  const [revenue, setRevenue] = useState<Revenue | null>(null);

  const calculateRevenue = () => {
    const viewsNum = parseInt(views.replace(/,/g, '')) || 0;
    const cpmVal = cpm[0];

    const dailyEarnings = (viewsNum / 1000) * cpmVal;
    const monthlyEarnings = dailyEarnings * 30;
    const yearlyEarnings = dailyEarnings * 365;
    const rpm = cpmVal * 0.55; // Estimated RPM after YouTube's cut

    setRevenue({
      dailyEarnings: `$${dailyEarnings.toFixed(2)}`,
      monthlyEarnings: `$${monthlyEarnings.toFixed(2)}`,
      yearlyEarnings: `$${yearlyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rpm: `$${rpm.toFixed(2)}`,
    });
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/tools")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Revenue Calculator</h1>
          <p className="text-sm text-muted-foreground">Estimate YouTube earnings</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="views">Daily Views</Label>
          <Input
            id="views"
            type="text"
            placeholder="e.g., 10,000"
            value={views}
            onChange={(e) => setViews(formatNumber(e.target.value))}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>CPM (Cost Per 1000 Views)</Label>
            <span className="text-primary font-semibold">${cpm[0]}</span>
          </div>
          <Slider
            value={cpm}
            onValueChange={setCpm}
            min={0.5}
            max={15}
            step={0.5}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0.50</span>
            <span>$15.00</span>
          </div>
          <p className="text-xs text-muted-foreground">
            CPM varies by niche: Gaming ($2-4), Finance ($10-15), Tech ($4-8)
          </p>
        </div>

        <Button onClick={calculateRevenue} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          Calculate Revenue
        </Button>
      </Card>

      {revenue && (
        <Card variant="gradient" className="p-5 space-y-4 animate-fade-in">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Estimated Earnings
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Daily</p>
              </div>
              <p className="text-xl font-bold text-foreground">{revenue.dailyEarnings}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Monthly</p>
              </div>
              <p className="text-xl font-bold text-foreground">{revenue.monthlyEarnings}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-green-500" />
                <p className="text-xs text-muted-foreground">Yearly Potential</p>
              </div>
              <p className="text-2xl font-bold text-green-400">{revenue.yearlyEarnings}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>Your RPM:</strong> {revenue.rpm} (after YouTube's 45% cut)
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            * Estimates based on typical AdSense revenue. Actual earnings vary.
          </p>
        </Card>
      )}
    </div>
  );
};
