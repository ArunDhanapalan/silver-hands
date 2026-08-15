import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ServiceDetailPage() {
  const { id } = useParams();
  return (
    <div className="space-y-4">
      <Link to="/services" className="btn btn-ghost btn-sm gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </Link>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <h2 className="text-xl font-bold">Service #{id}</h2>
      </div>
    </div>
  );
}
