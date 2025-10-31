import React from 'react';
import TabButton from './components/TabButton';
import Overview from './tabs/Overview';
import Users from './tabs/Users';
import Orders from './tabs/Orders';
import Cylinders from './tabs/Cylinders';
import Analytics from './tabs/Analytics';
import Settings from './tabs/Settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'orders' | 'cylinders' | 'analytics' | 'settings'>('overview');
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <TabButton id="overview" activeId={activeTab} icon="📊" label="Dashboard / Overview" onClick={setActiveTab} />
        <TabButton id="users" activeId={activeTab} icon="👥" label="User Management" onClick={setActiveTab} />
        <TabButton id="orders" activeId={activeTab} icon="📦" label="Orders Management" onClick={setActiveTab} />
        <TabButton id="cylinders" activeId={activeTab} icon="🛢️" label="Cylinder Tracking" onClick={setActiveTab} />
        <TabButton id="analytics" activeId={activeTab} icon="📈" label="Analytics & Reports" onClick={setActiveTab} />
        <TabButton id="settings" activeId={activeTab} icon="⚙️" label="System Settings" onClick={setActiveTab} />
      </div>
      <div className="mt-6">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'users' && <Users />}
        {activeTab === 'orders' && <Orders />}
        {activeTab === 'cylinders' && <Cylinders />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}


