"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import Icon from './Icon';
import Logo from "@/brand/Logo";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b border-soft-slate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo variant="main" size={250} />
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium lsg-transition ${
                pathname === "/"
                  ? "bg-lean-blue text-white"
                  : "text-midnight-core hover:text-lean-blue hover:bg-soft-slate"
              }`}
            >
              <Icon name="calculator" className="w-4 h-4 inline mr-2" size={16} />
              Calculator
            </Link>
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-medium lsg-transition ${
                pathname === "/admin"
                  ? "bg-lean-blue text-white"
                  : "text-midnight-core hover:text-lean-blue hover:bg-soft-slate"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
