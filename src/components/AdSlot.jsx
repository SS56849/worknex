import React from 'react';
import { Link } from 'react-router-dom';

export default function AdSlot({ variant = 'horizontal', className = '' }) {
  return (
    <div
      className={`rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-4 text-center ${
        variant === 'sidebar' ? 'py-8' : 'py-4'
      } ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
        Sponsored Placement
      </p>
      <p className="text-xs sm:text-sm font-medium text-slate-700">
        Reach thousands of qualified professionals across Thailand & Global markets.
      </p>
      <Link
        to="/pricing"
        className="inline-block mt-1.5 text-xs font-semibold text-blue-600 hover:underline"
      >
        Feature your company on WORKNEX →
      </Link>
    </div>
  );
}
