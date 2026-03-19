import Link from "next/link";
import { memo } from "react";
import { UI_TEXT, LANDING_FEATURES } from "@/lib/constants/messages";

const Landing = memo(function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
            {UI_TEXT.LANDING.TITLE}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
            {LANDING_FEATURES.SUBTITLE}
          </p>
        </header>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                {LANDING_FEATURES.FEATURE_1.TITLE}
              </h3>
              <p className="text-sm text-gray-600">
                {LANDING_FEATURES.FEATURE_1.DESCRIPTION}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                {LANDING_FEATURES.FEATURE_2.TITLE}
              </h3>
              <p className="text-sm text-gray-600">
                {LANDING_FEATURES.FEATURE_2.DESCRIPTION}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                {LANDING_FEATURES.FEATURE_3.TITLE}
              </h3>
              <p className="text-sm text-gray-600">
                {LANDING_FEATURES.FEATURE_3.DESCRIPTION}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {UI_TEXT.LANDING.DASHBOARD_BUTTON}
          </Link>
        </div>
      </div>
    </main>
  );
});

Landing.displayName = "Landing";

export default Landing;
