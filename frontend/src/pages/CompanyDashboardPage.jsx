import React from 'react';
import { Briefcase } from 'lucide-react';

export default function CompanyDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Company Job Management</h1>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <Briefcase className="w-10 h-10 text-primary mx-auto mb-2" />
        <h3 className="font-bold">Post Opportunities & Shortlist Seniors</h3>
        <p className="text-xs text-base-content/70">Connect with experienced professionals for bookkeeping, mentoring & localized tasks...</p>
      </div>
    </div>
  );
}
