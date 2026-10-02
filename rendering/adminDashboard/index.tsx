"use client";

import React from "react";
import { Calendar, Download } from "lucide-react";
import { PageHeader, PageBody, StatCard, StatusBadge } from "@/components/pageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { streams, tickets, orders, refunds, payouts } from "@/lib/mock-data";

export function AdminDashboardModule() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Real-time platform performance"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Today
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Total Customers" value="48,210" hint="+312 this week" accent />
          <StatCard label="Total Chefs" value="1,284" hint="892 active" />
          <StatCard label="Live Orders" value="173" hint="42 instant · 131 pre-order" />
          <StatCard label="Scheduled Orders" value="982" hint="next 24h" />
          <StatCard label="Daily Revenue" value="₹4.82L" hint="+12% vs yesterday" />
          <StatCard label="Daily GMV" value="₹7.16L" />
          <StatCard label="Pending Refunds" value="38" hint="₹42,300 value" />
          <StatCard label="Pending Payouts" value="₹2.41L" hint="14 chefs" />
          <StatCard label="Active Streams" value={streams.length} hint="2 degraded" />
          <StatCard label="Open Tickets" value={tickets.filter(t => t.status === "Open").length} hint="3 urgent" />
          <StatCard label="Avg Delivery Time" value="34 min" />
          <StatCard label="Avg Order Value" value="₹486" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Revenue (last 14 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-end gap-2">
                {Array.from({ length: 14 }).map((_, i) => {
                  const h = 30 + ((i * 37) % 70);
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/80 hover:bg-primary transition-colors"
                      style={{ height: `${h}%` }}
                      title={`Day ${i + 1}`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>Jun 04</span>
                <span>Jun 11</span>
                <span>Jun 17</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{o.id}</div>
                    <div className="text-xs text-muted-foreground">{o.customer}</div>
                  </div>
                  <StatusBadge value={o.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open Disputes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {refunds.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">
                      {r.id} · {r.reason}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.customer} · {r.order}
                    </div>
                  </div>
                  <StatusBadge value={r.status} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Payouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payouts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{p.chef}</div>
                    <div className="text-xs text-muted-foreground">{p.period}</div>
                  </div>
                  <div className="font-semibold">₹{p.amount.toLocaleString()}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
