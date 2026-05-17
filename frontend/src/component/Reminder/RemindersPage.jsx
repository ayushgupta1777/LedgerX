const SwipeableReminderItem = ({ reminder, onDismiss, onSeen, onRestore, onUpdate }) => {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const itemRef = useRef(null);
  const maxSwipeDistance = 200;
  const dismissThreshold = 80;

  const handleTouchStart = (e) => {
    if (reminder.isDismissed || isAnimating) return;
    setStartX(e.touches[0].clientX);
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwipeActive || reminder.isDismissed || isAnimating) return;
    
    const currentX = e.touches[0].clientX;
    const distance = startX - currentX;
    
    if (distance > 0 && distance <= maxSwipeDistance) {
      setSwipeDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isSwipeActive || isAnimating) return;
    
    if (swipeDistance > dismissThreshold) {
      setIsAnimating(true);
      setSwipeDistance(maxSwipeDistance);
      
      setTimeout(async () => {
        await onDismiss(reminder._id);
        setSwipeDistance(0);
        setIsAnimating(false);
      }, 300);
    } else {
      setSwipeDistance(0);
    }
    
    setIsSwipeActive(false);
  };

  const handleMouseDown = (e) => {
    if (reminder.isDismissed || isAnimating) return;
    setStartX(e.clientX);
    setIsSwipeActive(true);
  };

  const handleMouseMove = (e) => {
    if (!isSwipeActive || reminder.isDismissed || isAnimating) return;
    
    const currentX = e.clientX;
    const distance = startX - currentX;
    
    if (distance > 0 && distance <= maxSwipeDistance) {
      setSwipeDistance(distance);
    }
  };

  const handleMouseUp = async () => {
    if (!isSwipeActive || isAnimating) return;
    
    if (swipeDistance > dismissThreshold) {
      setIsAnimating(true);
      setSwipeDistance(maxSwipeDistance);
      
      setTimeout(async () => {
        await onDismiss(reminder._id);
        setSwipeDistance(0);
        setIsAnimating(false);
      }, 300);
    } else {
      setSwipeDistance(0);
    }
    
    setIsSwipeActive(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSwipeActive && !isAnimating) {
        handleMouseUp();
      }
    };

    const handleGlobalMouseMove = (e) => {
      if (isSwipeActive && !isAnimating) {
        handleMouseMove(e);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isSwipeActive, startX, swipeDistance, isAnimating]);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const reminderDate = new Date(date);
    const diffTime = reminderDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const isOverdue = () => {
    return new Date(reminder.reminderDate) < new Date();
  };

  const handleClick = async () => {
    if (!reminder.isSeen && !reminder.isDismissed && !isAnimating) {
      await onSeen(reminder._id);
    }
  };

  return (
    <div 
      ref={itemRef}
      className={`relative mb-3 rounded-2xl transition-all duration-300 ${
        reminder.isDismissed 
          ? 'bg-gray-100 opacity-60' 
          : 'bg-white hover:shadow-md'
      } ${
        !reminder.isSeen && !reminder.isDismissed 
          ? 'shadow-lg border-2' 
          : 'shadow-sm border border-gray-200'
      }`}
      style={{
        transform: `translateX(-${swipeDistance}px)`,
        transition: isSwipeActive || isAnimating ? 'none' : 'transform 0.3s ease',
        cursor: reminder.isDismissed ? 'default' : 'pointer',
        borderColor: !reminder.isSeen && !reminder.isDismissed ? getPriorityColor(reminder.priority) : undefined
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Swipe Action Background */}
      <div 
        className="absolute top-0 right-0 h-full flex items-center justify-center rounded-r-2xl transition-colors duration-200"
        style={{
          width: `${Math.min(swipeDistance, maxSwipeDistance)}px`,
          backgroundColor: swipeDistance > dismissThreshold ? '#ef4444' : '#f59e0b'
        }}
      >
        {swipeDistance > 20 && (
          <div className="text-white">
            {swipeDistance > dismissThreshold ? (
              <Trash2 size={18} />
            ) : (
              <ArrowUp size={18} className="rotate-90" />
            )}
          </div>
        )}
      </div>

      {/* Reminder Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            {/* Priority Indicator */}
            <div 
              className="w-1 h-10 rounded-full"
              style={{ backgroundColor: getPriorityColor(reminder.priority) }}
            />
            
            {/* Customer Info */}
            <div className="flex-1">
              <h4 className={`font-semibold text-gray-900 ${
                reminder.isDismissed ? 'line-through text-gray-500' : ''
              }`}>
                {reminder.customerName}
              </h4>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <User size={12} />
                {reminder.phoneNumber}
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {!reminder.isSeen && !reminder.isDismissed && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
            
            {isOverdue() && !reminder.isDismissed && (
              <AlertTriangle size={16} className="text-red-500" />
            )}
            
            {reminder.isDismissed && (
              <CheckCircle size={16} className="text-green-500" />
            )}
          </div>
        </div>

        {/* Message */}
        <div className="mb-3">
          <p className={`text-sm leading-relaxed ${
            reminder.isDismissed 
              ? 'text-gray-500 italic' 
              : 'text-gray-700'
          }`}>
            {reminder.message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 ${
              isOverdue() && !reminder.isDismissed 
                ? 'text-red-500 font-semibold' 
                : ''
            }`}>
              <Calendar size={12} />
              {formatDate(reminder.reminderDate)}
            </span>
            
            <span 
              className="px-2 py-1 rounded-md text-white text-xs font-semibold uppercase"
              style={{ backgroundColor: getPriorityColor(reminder.priority) }}
            >
              {reminder.priority}
            </span>
          </div>

          {/* Action buttons for dismissed reminders */}
          {reminder.isDismissed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore(reminder._id);
              }}
              className="flex items-center gap-1 px-2 py-1 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              <RotateCcw size={10} />
              Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
};