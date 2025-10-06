import React from 'react';
import TabButton from './components/TabButton';
import Overview from './tabs/Overview';
import Orders from './tabs/Orders';
import Cylinders from './tabs/Cylinders';
import Analytics from './tabs/Analytics';
import Loyalty from './tabs/Loyalty';
import Settings from './tabs/Settings';

export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'orders' | 'cylinders' | 'analytics' | 'loyalty' | 'settings'>('overview');
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <TabButton id="overview" activeId={activeTab} icon="📊" label="Dashboard Overview" onClick={setActiveTab} />
        <TabButton id="orders" activeId={activeTab} icon="📦" label="Orders Management" onClick={setActiveTab} />
        <TabButton id="cylinders" activeId={activeTab} icon="🛢️" label="Cylinder Tracking" onClick={setActiveTab} />
        <TabButton id="analytics" activeId={activeTab} icon="📈" label="Analytics" onClick={setActiveTab} />
        <TabButton id="loyalty" activeId={activeTab} icon="💰" label="Loyalty & Discounts" onClick={setActiveTab} />
        <TabButton id="settings" activeId={activeTab} icon="⚙️" label="Profile & Settings" onClick={setActiveTab} />
      </div>
      <div className="mt-6">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'orders' && <Orders />}
        {activeTab === 'cylinders' && <Cylinders />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'loyalty' && <Loyalty />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}


