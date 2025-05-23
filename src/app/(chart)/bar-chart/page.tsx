import BarChartOne from "@/components/charts/bar/BarChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Bar Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const demoData = [
  { name: "Jan", value: 168 },
  { name: "Feb", value: 385 },
  { name: "Mar", value: 201 },
  { name: "Apr", value: 298 },
  { name: "May", value: 187 },
  { name: "Jun", value: 195 },
  { name: "Jul", value: 291 },
  { name: "Aug", value: 110 },
  { name: "Sep", value: 215 },
  { name: "Oct", value: 390 },
  { name: "Nov", value: 280 },
  { name: "Dec", value: 112 }
];

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne data={demoData} />
        </ComponentCard>
      </div>
    </div>
  );
}