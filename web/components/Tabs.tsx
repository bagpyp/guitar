'use client';

import { ReactNode } from 'react';

interface TabsProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface TabProps {
  id: string;
  label: string;
  children: ReactNode;
}

export function Tabs({ children, activeTab, onTabChange }: TabsProps) {
  const tabs = (children as any[]).filter(child => child?.type === Tab);

  return (
    <div className="w-full">
      <div className="border-b border-gray-700">
        <nav className="flex space-x-4 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.props.id}
              onClick={() => onTabChange(tab.props.id)}
              className={`py-3 px-4 font-medium transition-colors ${
                activeTab === tab.props.id
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.props.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6">
        {tabs.find((tab) => tab.props.id === activeTab)?.props.children}
      </div>
    </div>
  );
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
