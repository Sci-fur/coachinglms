import { PackageOpen } from "lucide-react";

export default function EmptyState({ icon: Icon = PackageOpen, title = "Nothing here", description = "", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="font-semibold text-slate-600">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
