'use client';

import { useState } from 'react';
import { Tabs, Tab } from '@/components/Tabs';
import ScalePractice from '@/components/ScalePractice';

export default function Home() {
  const [activeTab, setActiveTab] = useState('scale-practice');

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Guitar Practice</h1>
          <p className="text-gray-400">Master scales, patterns, and theory</p>
        </header>

        <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
          <Tab id="scale-practice" label="Scale Practice">
            <ScalePractice />
          </Tab>
          <Tab id="triads" label="Major Triads">
            <div className="text-center text-gray-400 py-12">
              <p className="text-xl">Major triads feature coming soon!</p>
              <p className="text-sm mt-2">Display all major triads along 4 string groups with inversions</p>
            </div>
          </Tab>
        </Tabs>
      </div>
    </main>
  );
}
