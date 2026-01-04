import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface GrowthChartProps {
  data: { date: string; followers: number; views: number }[];
  title: string;
}

export const GrowthChart = ({ data, title }: GrowthChartProps) => {
  return (
    <Card variant="gradient" className="p-5">
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 10 }}
              axisLine={{ stroke: "hsl(222, 47%, 18%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 10 }}
              axisLine={{ stroke: "hsl(222, 47%, 18%)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 10%)",
                border: "1px solid hsl(222, 47%, 18%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(210, 40%, 98%)" }}
            />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFollowers)"
              name="Followers"
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="hsl(270, 70%, 60%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViews)"
              name="Views (K)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Followers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-xs text-muted-foreground">Views (K)</span>
        </div>
      </div>
    </Card>
  );
};
