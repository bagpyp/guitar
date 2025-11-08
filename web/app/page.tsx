'use client';

import { useState } from 'react';
import { Tabs, Tab } from '@/components/Tabs';
import ScalePractice from '@/components/ScalePractice';
import MajorTriads from '@/components/MajorTriads';

export default function Home() {
  const [activeTab, setActiveTab] = useState('triads');

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Guitar Practice</h1>
          <p className="text-gray-400">Master scales, patterns, and theory</p>
        </header>

        <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
          <Tab id="triads" label="Major Triads">
            <MajorTriads />
          </Tab>
          <Tab id="scale-practice" label="Scale Practice">
            <ScalePractice />
          </Tab>
        </Tabs>
      </div>
    </main>
  );
}
