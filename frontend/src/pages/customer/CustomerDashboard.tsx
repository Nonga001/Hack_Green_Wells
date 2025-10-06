import React from 'react';
import Overview from './tabs/Overview';
import Order from './tabs/Order';
import Orders from './tabs/Orders';
import Cylinder from './tabs/Cylinder';
import Loyalty from './tabs/Loyalty';
import Settings from './tabs/Settings';
import TabButton from './components/TabButton';

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'order' | 'orders' | 'cylinder' | 'loyalty' | 'settings'>('overview');

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <TabButton id="overview" activeId={activeTab} label="Home / Overview" icon="🏠" onClick={setActiveTab} />
        <TabButton id="order" activeId={activeTab} label="Order / Refill" icon="🛒" onClick={setActiveTab} />
        <TabButton id="orders" activeId={activeTab} label="My Orders" icon="📦" onClick={setActiveTab} />
        <TabButton id="cylinder" activeId={activeTab} label="My Cylinder" icon="⛽" onClick={setActiveTab} />
        <TabButton id="loyalty" activeId={activeTab} label="Loyalty & Rewards" icon="🎁" onClick={setActiveTab} />
        <TabButton id="settings" activeId={activeTab} label="Settings" icon="⚙️" onClick={setActiveTab} />
      </div>
      <div className="mt-6">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'order' && <Order />}
        {activeTab === 'orders' && <Orders />}
        {activeTab === 'cylinder' && <Cylinder />}
        {activeTab === 'loyalty' && <Loyalty />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}


