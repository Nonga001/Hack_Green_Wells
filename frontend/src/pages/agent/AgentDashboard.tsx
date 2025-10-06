import React from 'react';
import TabButton from './components/TabButton';
import Overview from './tabs/Overview';
import Assigned from './tabs/Assigned';
import MapTab from './tabs/Map';
import Scan from './tabs/Scan';
import Earnings from './tabs/Earnings';
import Settings from './tabs/Settings';

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'assigned' | 'map' | 'scan' | 'earnings' | 'settings'>('overview');
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <TabButton id="overview" activeId={activeTab} icon="🏠" label="Home / Overview" onClick={setActiveTab} />
        <TabButton id="assigned" activeId={activeTab} icon="🚦" label="Assigned Deliveries" onClick={setActiveTab} />
        <TabButton id="map" activeId={activeTab} icon="📍" label="Map / Route" onClick={setActiveTab} />
        <TabButton id="scan" activeId={activeTab} icon="🛢️" label="Cylinder Scan" onClick={setActiveTab} />
        <TabButton id="earnings" activeId={activeTab} icon="💰" label="Earnings & History" onClick={setActiveTab} />
        <TabButton id="settings" activeId={activeTab} icon="⚙️" label="Settings" onClick={setActiveTab} />
      </div>
      <div className="mt-6">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'assigned' && <Assigned />}
        {activeTab === 'map' && <MapTab />}
        {activeTab === 'scan' && <Scan />}
        {activeTab === 'earnings' && <Earnings />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}


