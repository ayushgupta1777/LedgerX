const FilterBar = ({ filter, setFilter, priorityFilter, setPriorityFilter, counts }) => {
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All', count: counts.total },
    { value: 'active', label: 'Active', count: counts.active },
    { value: 'unseen', label: 'Unseen', count: counts.unseen },
    { value: 'dismissed', label: 'Dismissed', count: counts.dismissed }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  return (
    <div className="mb-4">
      {/* Main Filter Tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                filter === option.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                filter === option.value
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Additional Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Priority:</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

