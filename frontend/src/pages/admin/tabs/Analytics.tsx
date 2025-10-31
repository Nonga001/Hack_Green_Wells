import Card from '../components/Card';

export default function Analytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">ML Model Accuracy</h3>
        <div className="mt-2 h-48 rounded-lg bg-slate-50 grid place-items-center text-slate-400 text-sm">Accuracy Chart Placeholder</div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Refill Patterns</h3>
        <div className="mt-2 h-48 rounded-lg bg-slate-50 grid place-items-center text-slate-400 text-sm">Patterns Chart Placeholder</div>
      </Card>
      <Card className="lg:col-span-3">
        <h3 className="text-lg font-semibold text-slate-900">Regional Demand</h3>
        <div className="mt-2 h-40 rounded-lg bg-slate-50 grid place-items-center text-slate-400 text-sm">Regional Map Placeholder</div>
      </Card>
      <Card className="lg:col-span-3">
        <h3 className="text-lg font-semibold text-slate-900">Loyalty Impact</h3>
        <div className="mt-2 h-40 rounded-lg bg-slate-50 grid place-items-center text-slate-400 text-sm">Loyalty Chart Placeholder</div>
      </Card>
    </div>
  );
}


