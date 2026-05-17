const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="text-2xl font-bold text-blue-600">{stats.unseen}</div>
        <div className="text-sm text-blue-700">Unseen</div>
      </div>
      <div className="bg-orange-50 rounded-lg p-3">
        <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
        <div className="text-sm text-orange-700">Due Today</div>
      </div>
      <div className="bg-red-50 rounded-lg p-3">
        <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        <div className="text-sm text-red-700">Overdue</div>
      </div>
      <div className="bg-green-50 rounded-lg p-3">
        <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
        <div className="text-sm text-green-700">This Week</div>
      </div>
    </div>
  );
};