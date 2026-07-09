"use client";

import { ChevronDown, Mail } from "lucide-react";

interface EmailAccountPublic {
  id: string;
  label: string;
  email_address: string;
  is_active: boolean;
}

interface Props {
  accounts: EmailAccountPublic[];
  activeAccountId: string | null;
  onSelect: (id: string) => void;
}

export function AccountSwitcher({ accounts, activeAccountId, onSelect }: Props) {
  const active = accounts.find((a) => a.id === activeAccountId);

  if (accounts.length <= 1 && active) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-gray-500 truncate max-w-[200px]">{active.email_address}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={activeAccountId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-lg px-2.5 py-1 pr-7 text-sm text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
      >
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.label} — {account.email_address}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  );
}
