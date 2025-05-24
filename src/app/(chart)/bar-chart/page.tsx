import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import BarChartContent from "./components/BarChartContent";

export const metadata: Metadata = {
  title: "Next.js Bar Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Bar Chart" />
      <BarChartContent />
    </div>
  );
}