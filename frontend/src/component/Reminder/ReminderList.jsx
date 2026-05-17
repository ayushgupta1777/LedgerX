const EnhancedReminderList = () => {
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({});
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filter, priorityFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reminderResponse, statsResponse] = await Promise.all([
        api.getReminders({ status: filter, priority: priorityFilter }),
        api.getStats()
      ]);
      
      setReminders(reminderResponse.reminders);
      setCounts(reminderResponse.counts);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.dismissReminder(id);
      setReminders(reminders.map(r => 
        r._id === id 
          ? { ...r, isDismissed: true, dismissedAt: new Date(), isSeen: true }
          : r
      ));
      // Refresh counts
      fetchData();
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  const handleSeen = async (id) => {
    try {
      await api.markAsSeen(id);
      setReminders(reminders.map(r => 
        r._id === id 
          ? { ...r, isSeen: true, seenAt: new Date() }
          : r
      ));
      // Refresh counts
      fetchData();
    } catch (error) {
      console.error('Error marking as seen:', error);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.restoreReminder(id);
      setReminders(reminders.map(r => 
        r._id === id 
          ? { ...r, isDismissed: false, dismissedAt: null }
          : r
      ));
      // Refresh counts
      fetchData();
    } catch (error) {
      console.error('Error restoring reminder:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reminders</h1>
            <p className="text-sm text-gray-500">Manage your customer reminders</p>
          </div>
          <button className="p-2 bg-blue-600 text-white rounded-lg">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Filter Bar */}
        <FilterBar 
          filter={filter}
          setFilter={setFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          counts={counts}
        />

        {/* Reminders List */}
        <div className="space-y-0">
          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? "You don't have any reminders yet."
                  : `No ${filter} reminders found.`
                }
              </p>
            </div>
          ) : (
            <>
              {reminders.map((reminder) => (
                <SwipeableReminderItem
                  key={reminder._id}
                  reminder={reminder}
                  onDismiss={handleDismiss}
                  onSeen={handleSeen}
                  onRestore={handleRestore}
                />
              ))}
            </>
          )}
        </div>

        {/* Help Text */}
        {reminders.length > 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-gray-400">
              💡 Swipe left on reminders to dismiss them
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedReminderList;