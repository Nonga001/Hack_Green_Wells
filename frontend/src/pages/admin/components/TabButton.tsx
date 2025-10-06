import React from 'react';

export default function TabButton({
  id,
  activeId,
  label,
  icon,
  onClick,
}: {
  id: string;
  activeId: string;
  label: string;
  icon: string;
  onClick: (id: string) => void;
}) {
  const isActive = activeId === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ring-1 transition-all duration-200 ${
        isActive
          ? 'bg-slate-900 text-white ring-slate-900 shadow hover:shadow-md'
          : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}


