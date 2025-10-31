import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

function CylinderPredictionCard({ cylinderSizeKgProp }: { cylinderSizeKgProp?: number }) {
  // inputs
  const [burners, setBurners] = React.useState(1);
  const [dailyHours, setDailyHours] = React.useState(2);
  const [cylinderSizeKg, setCylinderSizeKg] = React.useState<number>(cylinderSizeKgProp || 13);

  // when parent provides a selected cylinder size, keep in sync
  React.useEffect(()=>{
    if (cylinderSizeKgProp) setCylinderSizeKg(Number(cylinderSizeKgProp));
  }, [cylinderSizeKgProp]);

  // NOTE: Estimated remaining percent is computed, not editable by user.
  // For now we use a conservative default heuristic (50%). Later this can be
  // replaced with a server-side model or more advanced calculation.
  const computedRemainingPercent = 50;

  const burnRateKgPerHourPerBurner = 0.18;
  const remainingKg = (cylinderSizeKg * Math.max(0, Math.min(100, computedRemainingPercent))) / 100;
  const dailyConsumptionKg = Math.max(0, burners) * Math.max(0, dailyHours) * burnRateKgPerHourPerBurner;
  const estimatedDays = dailyConsumptionKg > 0 ? Math.max(0, remainingKg / dailyConsumptionKg) : 0;

  return (
    <Card className="lg:col-span-1">
      <h3 className="text-lg font-semibold text-slate-900">Usage-based Prediction</h3>
      <p className="mt-1 text-sm text-slate-600">Enter your cooking details to estimate remaining days.</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm font-medium text-slate-700">Number of Burners
          <input type="number" min={1} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={burners} onChange={(e) => setBurners(Number(e.target.value) || 0)} />
        </label>
        <label className="text-sm font-medium text-slate-700">Daily Cooking Hours
          <input type="number" min={0} step={0.5} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={dailyHours} onChange={(e) => setDailyHours(Number(e.target.value) || 0)} />
        </label>
        <label className="text-sm font-medium text-slate-700">Cylinder Size (kg)
          <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={cylinderSizeKg} onChange={(e) => setCylinderSizeKg(Number(e.target.value))}>
            <option value={6}>6</option>
            <option value={13}>13</option>
            <option value={22.5}>22.5</option>
            <option value={50}>50</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Estimated Remaining (%)
          <input type="number" min={0} max={100} readOnly className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 bg-slate-50" value={computedRemainingPercent} />
        </label>
      </div>
      <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-800 p-3 text-sm">
        Estimated remaining: <span className="font-semibold">~{estimatedDays.toFixed(1)} days</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">Assumes burn rate {burnRateKgPerHourPerBurner} kg/hour per burner.</p>
    </Card>
  );
}

export default function Cylinder() {
  const [owned, setOwned] = React.useState<any[]>([]);
  const [showScanner, setShowScanner] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [videoRef, setVideoRef] = React.useState<HTMLVideoElement | null>(null);
  const [scannedId, setScannedId] = React.useState<string | null>(null);
  const [lastScanCoordsById, setLastScanCoordsById] = React.useState<Record<string, { lat: number; lon: number }>>({});
  const [details, setDetails] = React.useState<any | null>(null);
  const [selectedCylinderId, setSelectedCylinderId] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const docs = await api('/cylinders/customer', { headers: { ...authHeaders() } });
        setOwned(docs || []);
      } catch {}
    })();
  }, []);

  // start camera and scan using BarcodeDetector if available
  async function startScanner() {
    setShowScanner(true);
    setScannedId(null);
    setDetails(null);
    // try to get position
    try {
      navigator.geolocation.getCurrentPosition((pos)=>{
        // store coords for the currently selected cylinder (if any)
        if (selectedCylinderId) {
          setLastScanCoordsById((cur) => ({ ...cur, [selectedCylinderId]: { lat: pos.coords.latitude, lon: pos.coords.longitude } }));
        }
      }, ()=>{});
    } catch {}
    if ((window as any).BarcodeDetector) {
      try {
        const video = document.createElement('video');
        setVideoRef(video);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.autoplay = true;
        video.playsInline = true;
        video.srcObject = stream;
        await video.play();
        setScanning(true);
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const scanLoop = async () => {
          if (!scanning) return;
          try {
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0) {
              const data = barcodes[0].rawValue || barcodes[0].rawData || barcodes[0].displayValue;
              if (data) {
                stopScanner();
                handleScanned(String(data));
                return;
              }
            }
          } catch (e) {
            // ignore detection errors
          }
          requestAnimationFrame(scanLoop);
        };
        requestAnimationFrame(scanLoop);
      } catch (e) {
        // fallback: show manual input
        setScanning(false);
      }
    } else {
      // no BarcodeDetector: fallback to file input or manual
      setScanning(false);
    }
  }

  function stopScanner() {
    setScanning(false);
    setShowScanner(false);
    if (videoRef && videoRef.srcObject) {
      const s = videoRef.srcObject as MediaStream;
      s.getTracks().forEach(t => t.stop());
      videoRef.srcObject = null as any;
    }
    setVideoRef(null);
  }

  async function handleScanned(data: string) {
    const cylId = String(data).trim();
    setScannedId(cylId);
    // find in owned list
    const found = owned.find(o => (o.cylId === cylId) || (o.cylId === String(cylId)));
    if (found) {
      // mark as selected and update last-scan coords if geolocation available
      setSelectedCylinderId(found.cylId);
      // fetch last refill/delivery info from orders
      try {
        const orders: any[] = await api('/orders/customer', { headers: { ...authHeaders() } });
        const last = (orders || []).filter(o => (o.cylinder?.id === cylId || o.cylinder?.id === found.cylId)).sort((a,b)=> (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))[0] || null;
        setDetails({ ...found, lastOrder: last });
      } catch {
        setDetails(found);
      }
      // attach lastScanCoords if we previously captured location for this id
      const prev = lastScanCoordsById[cylId] || null;
      if (prev) {
        setDetails((d:any)=> ({ ...(d||{}), lastScanCoords: prev }));
      }
    } else {
      // not owned by customer
      setDetails({ notOwned: true, cylId });
    }
  }

  async function reportLost() {
    if (!details) return;
    const supplierId = details.supplierId;
    const cylId = details.cylId || scannedId;
    try {
      await api('/cylinders/report', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ supplierId, cylId, reason: 'reported-lost-by-customer' }) });
      alert('Reported lost/stolen. We updated the cylinder status.');
      // refresh owned list
      const docs = await api('/cylinders/customer', { headers: { ...authHeaders() } });
      setOwned(docs || []);
      setDetails(null);
    } catch (e:any) {
      alert(e?.message || 'Failed to report cylinder');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-900">Scan Cylinder (QR/NFC)</h3>
        <p className="mt-1 text-sm text-slate-600">Scan a cylinder QR to view details and report if needed.</p>
        <div className="mt-3 flex flex-col gap-2">
          <button onClick={startScanner} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"> 
            <span>📷</span>
            <span>Open Scanner</span>
          </button>
          <button onClick={() => { const manual = prompt('Enter cylinder ID'); if (manual) handleScanned(manual); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200">
            <span>⌨️</span>
            <span>Enter ID Manually</span>
          </button>
        </div>
        {showScanner && (
          <div className="mt-3">
            {scanning ? (
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <div id="video-container" className="w-full h-64 bg-black grid place-items-center">
                  {/* video element will be attached programmatically for BarcodeDetector path */}
                </div>
                <div className="p-2 text-xs text-slate-500">Point your camera at the cylinder QR code.</div>
                <div className="flex gap-2 p-2">
                  <button onClick={stopScanner} className="px-3 py-1 rounded bg-slate-200">Close</button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">Camera unavailable — use manual entry.</div>
            )}
          </div>
        )}
      </Card>
      <Card className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-900">Cylinder Details</h3>
        <div className="mt-2 text-sm text-slate-700 space-y-1">
          {details ? (
            details.notOwned ? (
              <div>This cylinder ({details.cylId}) is not registered to your account.</div>
            ) : (
              <>
                <div>Current ID: {details.cylId}</div>
                <div>Size: {details.size} • Brand: {details.brand}</div>
                <div>Refill Price: {details.refillPrice ? `KES ${details.refillPrice}` : 'N/A'}</div>
                <div>Last Refill: {details.lastOrder?.createdAt ? new Date(details.lastOrder.createdAt).toLocaleString() : 'Unknown'}</div>
                <div>Last Known Location: {lastScanCoordsById[details.cylId] ? `${lastScanCoordsById[details.cylId].lat.toFixed(5)}, ${lastScanCoordsById[details.cylId].lon.toFixed(5)}` : 'Not scanned yet'}</div>
                <div className="mt-2">
                  <button onClick={reportLost} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-700">
                    <span>🚨</span>
                    <span>Report Lost/Stolen</span>
                  </button>
                </div>
              </>
            )
          ) : (
            <div>No cylinder scanned yet. Use the scanner or enter an ID.</div>
          )}
        </div>
        {(details?.lastScanCoords || (selectedCylinderId && lastScanCoordsById[selectedCylinderId])) && (
          <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
            {(() => {
              const coords = details?.lastScanCoords || (selectedCylinderId ? lastScanCoordsById[selectedCylinderId] : null);
              if (!coords) return null;
              return <iframe title="last-scan-map" className="w-full h-44" src={`https://www.openstreetmap.org/export/embed.html?marker=${coords.lat},${coords.lon}&layer=mapnik`} />;
            })()}
          </div>
        )}
      </Card>
  <CylinderPredictionCard cylinderSizeKgProp={details?.size ? Number(details.size) : undefined} />
    </div>
  );
}


