import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { format, parse, isValid, isBefore, isAfter, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, isWithinInterval } from 'date-fns';

// Types
export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

export type PresetRange = {
  label: string;
  range: () => DateRange;
};

export type DatePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: PresetRange[];
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  mode?: 'classic' | 'minimal' | 'dual' | 'timeline' | 'pill';
  className?: string;
};

// Core Date Utilities
const dateUtils = {
  isValidRange(range: DateRange): boolean {
    return range.startDate !== null && range.endDate !== null && isBefore(range.startDate, range.endDate);
  },
  parseRelativeDate(input: string, baseDate: Date = new Date()): Date {
    if (/^\d+d$/.test(input)) {
      const days = parseInt(input);
      return addDays(baseDate, days);
    }
    if (/^\d+w$/.test(input)) {
      const weeks = parseInt(input);
      return addDays(baseDate, weeks * 7);
    }
    if (/^\d+m$/.test(input)) {
      const months = parseInt(input);
      const date = new Date(baseDate);
      date.setMonth(date.getMonth() + months);
      return date;
    }
    return baseDate;
  },
  formatRange(range: DateRange, formatStr: string = 'PPP'): string {
    if (!range.startDate || !range.endDate) return '';
    return `${format(range.startDate, formatStr)} – ${format(range.endDate, formatStr)}`;
  },
  getTodayDot(range: DateRange): React.ReactNode {
    const today = new Date();
    const isTodaySelected = range.startDate?.toDateString() === today.toDateString() || 
                           range.endDate?.toDateString() === today.toDateString();
    return (
      <div className={`today-dot ${isTodaySelected ? 'selected' : ''}`}>
        Today
      </div>
    );
  }
};

// Classic Dual-Month Calendar
export const ClassicDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  presets = [
    { label: 'Today', range: () => ({ startDate: new Date(), endDate: new Date() }) },
    { label: 'Yesterday', range: () => ({ startDate: addDays(new Date(), -1), endDate: addDays(new Date(), -1) }) },
    { label: 'Last 7 Days', range: () => ({ startDate: addDays(new Date(), -6), endDate: new Date() }) },
    { label: 'Last 30 Days', range: () => ({ startDate: addDays(new Date(), -29), endDate: new Date() }) },
    { label: 'This Week', range: () => ({ 
      startDate: startOfWeek(new Date()), 
      endDate: endOfWeek(new Date()) 
    }) },
    { label: 'This Month', range: () => ({ 
      startDate: startOfMonth(new Date()), 
      endDate: endOfMonth(new Date()) 
    }) },
    { label: 'This Quarter', range: () => ({ 
      startDate: startOfQuarter(new Date()), 
      endDate: endOfQuarter(new Date()) 
    }) }
  ],
  minDate,
  maxDate,
  format = 'PPP',
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>(value);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    checkMobile();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectDate = (date: Date) => {
    setSelectedRange(prev => {
      if (!prev.startDate) {
        return { ...prev, startDate: date };
      } else if (!prev.endDate) {
        return { ...prev, endDate: date };
      } else {
        return { startDate: date, endDate: null };
      }
    });
  };

  const handleApply = () => {
    onChange(selectedRange);
    setShowCalendar(false);
  };

  const handleClear = () => {
    setSelectedRange({ startDate: null, endDate: null });
    onChange({ startDate: null, endDate: null });
  };

  const handlePresetSelect = (preset: PresetRange) => {
    const range = preset.range();
    setSelectedRange(range);
    onChange(range);
    setShowCalendar(false);
  };

  const renderCalendar = () => {
    const monthsToShow = isMobile ? 1 : 2;
    const currentMonth = new Date();
    const calendarMonths = Array.from({ length: monthsToShow }, (_, i) => {
      const month = new Date(currentMonth);
      month.setMonth(month.getMonth() + i);
      return month;
    });

    return (
      <div className="classic-calendar">
        {calendarMonths.map((month, idx) => (
          <div key={idx} className="calendar-month">
            <div className="month-header">{format(month, 'MMMM yyyy')}</div>
            <div className="weekdays">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            <div className="days">
              {Array.from({ length: 42 }, (_, i) => {
                const date = new Date(month);
                date.setDate(month.getDate() - month.getDay() + i + 1);
                const isOutsideMonth = date.getMonth() !== month.getMonth();
                const isStart = selectedRange.startDate?.toDateString() === date.toDateString();
                const isEnd = selectedRange.endDate?.toDateString() === date.toDateString();
                const isInRange = isWithinInterval(date, {
                  start: selectedRange.startDate || new Date(0),
                  end: selectedRange.endDate || new Date(0)
                });
                const isToday = date.toDateString() === new Date().toDateString();
                const isHovered = hoverDate?.toDateString() === date.toDateString();

                return (
                  <div 
                    key={i}
                    className={`day ${isOutsideMonth ? 'outside' : ''} 
                      ${isStart ? 'selected start' : ''}
                      ${isEnd ? 'selected end' : ''}
                      ${isInRange ? 'in-range' : ''}
                      ${isToday ? 'today' : ''}
                      ${isHovered ? 'hovered' : ''}`}
                    onClick={() => !isOutsideMonth && handleSelectDate(date)}
                    onMouseEnter={() => !isOutsideMonth && setHoverDate(date)}
                  >
                    <div className="day-number">{date.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`classic-datepicker ${className}`}>
      <div className="selected-range">
        {dateUtils.formatRange(selectedRange, format)}
        {dateUtils.getTodayDot(selectedRange)}
      </div>
      
      <div className="presets">
        {presets.map((preset, idx) => (
          <button 
            key={idx} 
            onClick={() => handlePresetSelect(preset)}
            className={`preset ${selectedRange.startDate && 
              isWithinInterval(new Date(), { 
                start: selectedRange.startDate, 
                end: selectedRange.endDate || new Date() 
              }) ? 'active' : ''}`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      
      <button 
        className="open-calendar"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        {showCalendar ? 'Close' : 'Open Calendar'}
      </button>
      
      {showCalendar && (
        <div className="calendar-popup">
          {renderCalendar()}
          <div className="calendar-footer">
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleApply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Minimal Input with Smart Dropdown
export const MinimalDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  presets = [
    { label: 'Today', range: () => ({ startDate: new Date(), endDate: new Date() }) },
    { label: 'Yesterday', range: () => ({ startDate: addDays(new Date(), -1), endDate: addDays(new Date(), -1) }) },
    { label: 'Last 7 Days', range: () => ({ startDate: addDays(new Date(), -6), endDate: new Date() }) },
    { label: 'Last 30 Days', range: () => ({ startDate: addDays(new Date(), -29), endDate: new Date() }) }
  ],
  format = 'PPP',
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState(dateUtils.formatRange(value, format));
  const [selectedRange, setSelectedRange] = useState<DateRange>(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Smart parsing logic
    try {
      if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(value)) {
        // Parse simple date format
        const [startStr, endStr] = value.split('–');
        const start = parse(startStr.trim(), 'MM/dd/yyyy', new Date());
        const end = parse(endStr.trim(), 'MM/dd/yyyy', new Date());
        if (isValid(start) && isValid(end)) {
          setSelectedRange({ startDate: start, endDate: end });
        }
      } else if (/^\d+d$/.test(value)) {
        // Parse relative days
        const days = parseInt(value);
        setSelectedRange({
          startDate: addDays(new Date(), -days),
          endDate: new Date()
        });
      } else if (/^\d+w$/.test(value)) {
        // Parse relative weeks
        const weeks = parseInt(value);
        setSelectedRange({
          startDate: addDays(new Date(), -weeks * 7),
          endDate: new Date()
        });
      } else if (/^\d+m$/.test(value)) {
        // Parse relative months
        const months = parseInt(value);
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        setSelectedRange({
          startDate: start,
          endDate: new Date()
        });
      } else if (value.toLowerCase() === 'today') {
        setSelectedRange({ startDate: new Date(), endDate: new Date() });
      } else if (value.toLowerCase() === 'yesterday') {
        setSelectedRange({ 
          startDate: addDays(new Date(), -1), 
          endDate: addDays(new Date(), -1) 
        });
      }
    } catch (error) {
      console.error('Error parsing date input:', error);
    }
  };

  const handleApply = () => {
    onChange(selectedRange);
    setIsDropdownOpen(false);
    setInputValue(dateUtils.formatRange(selectedRange, format));
  };

  const handleClear = () => {
    setSelectedRange({ startDate: null, endDate: null });
    onChange({ startDate: null, endDate: null });
    setInputValue('');
    setIsDropdownOpen(false);
  };

  return (
    <div className={`minimal-datepicker ${className}`}>
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Select date range"
          className="date-input"
        />
        <button className="calendar-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          📅
        </button>
      </div>
      
      {isDropdownOpen && (
        <div className="dropdown-content">
          <div className="presets">
            {presets.map((preset, idx) => (
              <button 
                key={idx} 
                onClick={() => {
                  const range = preset.range();
                  setSelectedRange(range);
                  setInputValue(dateUtils.formatRange(range, format));
                }}
                className={`preset ${selectedRange.startDate && 
                  isWithinInterval(new Date(), { 
                    start: selectedRange.startDate, 
                    end: selectedRange.endDate || new Date() 
                  }) ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className="calendar">
            {/* Calendar implementation would go here */}
            <div className="calendar-header">
              <button>Previous</button>
              <span>April 2026</span>
              <button>Next</button>
            </div>
            <div className="calendar-grid">
              {/* Calendar grid implementation */}
            </div>
          </div>
          
          <div className="actions">
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleApply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Two Separate Fields with Linked Calendar
export const DualDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  format = 'PPP',
  className = ''
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingField, setEditingField] = useState<'from' | 'to'>('from');
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange>(value);

  const handleDateSelect = (date: Date) => {
    setSelectedRange(prev => {
      if (editingField === 'from') {
        return { startDate: date, endDate: prev.endDate };
      } else {
        return { startDate: prev.startDate, endDate: date };
      }
    });
    setEditingField(editingField === 'from' ? 'to' : 'from');
  };

  const handleApply = () => {
    onChange(selectedRange);
    setIsCalendarOpen(false);
  };

  const handleClear = () => {
    setSelectedRange({ startDate: null, endDate: null });
    onChange({ startDate: null, endDate: null });
  };

  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = new Date();
    
    return (
      <div className="dual-calendar">
        <div className="calendar-header">
          <button>Previous</button>
          <span>{format(currentMonth, 'MMMM yyyy')}</span>
          <button>Next</button>
        </div>
        <div className="weekdays">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="days">
          {Array.from({ length: 42 }, (_, i) => {
            const date = new Date(currentMonth);
            date.setDate(currentMonth.getDate() - currentMonth.getDay() + i + 1);
            const isOutsideMonth = date.getMonth() !== currentMonth.getMonth();
            const isStart = selectedRange.startDate?.toDateString() === date.toDateString();
            const isEnd = selectedRange.endDate?.toDateString() === date.toDateString();
            const isInRange = isWithinInterval(date, {
              start: selectedRange.startDate || new Date(0),
              end: selectedRange.endDate || new Date(0)
            });
            const isToday = date.toDateString() === today.toDateString();
            const isHovered = hoverDate?.toDateString() === date.toDateString();

            return (
              <div 
                key={i}
                className={`day ${isOutsideMonth ? 'outside' : ''} 
                  ${isStart ? 'selected start' : ''}
                  ${isEnd ? 'selected end' : ''}
                  ${isInRange ? 'in-range' : ''}
                  ${isToday ? 'today' : ''}
                  ${isHovered ? 'hovered' : ''}`}
                onClick={() => !isOutsideMonth && handleDateSelect(date)}
                onMouseEnter={() => !isOutsideMonth && setHoverDate(date)}
              >
                <div className="day-number">{date.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`dual-datepicker ${className}`}>
      <div className="input-fields">
        <div className="from-field">
          <input
            type="text"
            value={selectedRange.startDate ? format(selectedRange.startDate, format) : ''}
            onFocus={() => {
              setEditingField('from');
              setIsCalendarOpen(true);
            }}
            placeholder="From"
          />
        </div>
        <div className="to-field">
          <input
            type="text"
            value={selectedRange.endDate ? format(selectedRange.endDate, format) : ''}
            onFocus={() => {
              setEditingField('to');
              setIsCalendarOpen(true);
            }}
            placeholder="To"
          />
          <button className="calendar-icon" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
            📅
          </button>
        </div>
      </div>
      
      {isCalendarOpen && (
        <div className="calendar-popup">
          {renderCalendar()}
          <div className="calendar-footer">
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleApply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Timeline/Slider Style
export const TimelineDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  className = ''
}) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>(value);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleDateChange = (start: Date, end: Date) => {
    setSelectedRange({ startDate: start, endDate: end });
    onChange({ startDate: start, endDate: end });
  };

  const handleZoom = (level: number) => {
    setZoomLevel(level);
    // Recalculate positions based on zoom level
  };

  return (
    <div className={`timeline-datepicker ${className}`}>
      <div className="timeline-header">
        <button onClick={() => setViewMode('day')}>Day</button>
        <button onClick={() => setViewMode('week')}>Week</button>
        <button onClick={() => setViewMode('month')}>Month</button>
        <div className="zoom-controls">
          <button onClick={() => handleZoom(zoomLevel - 1)}>-</button>
          <span>{zoomLevel}x</span>
          <button onClick={() => handleZoom(zoomLevel + 1)}>+</button>
        </div>
      </div>
      
      <div className="timeline-container">
        <div className="timeline-track">
          {/* Timeline visualization with draggable handles */}
          <div className="start-handle" style={{ left: '20%' }}></div>
          <div className="end-handle" style={{ left: '60%' }}></div>
          <div className="selected-range" style={{ left: '20%', width: '40%' }}></div>
        </div>
        
        <div className="timeline-labels">
          <div className="start-label">15 Feb 2026</div>
          <div className="end-label">28 Feb 2026</div>
        </div>
      </div>
      
      <div className="timeline-footer">
        <button onClick={() => handleDateChange(new Date(), new Date())}>Today</button>
        <button onClick={() => handleDateChange(addDays(new Date(), -7), new Date())}>Last 7 Days</button>
      </div>
    </div>
  );
};

// Floating Pill with Quick Edit
export const PillDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  presets = [
    { label: 'Today', range: () => ({ startDate: new Date(), endDate: new Date() }) },
    { label: 'Yesterday', range: () => ({ startDate: addDays(new Date(), -1), endDate: addDays(new Date(), -1) }) },
    { label: 'Last 7 Days', range: () => ({ startDate: addDays(new Date(), -6), endDate: new Date() }) },
    { label: 'Last 30 Days', range: () => ({ startDate: addDays(new Date(), -29), endDate: new Date() }) }
  ],
  format = 'PPP',
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>(value);

  const handlePresetSelect = (preset: PresetRange) => {
    const range = preset.range();
    setSelectedRange(range);
    onChange(range);
    setIsDropdownOpen(false);
  };

  const handleCustomSelect = (range: DateRange) => {
    setSelectedRange(range);
    onChange(range);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`pill-datepicker ${className}`}>
      <div 
        className="date-pill"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {dateUtils.formatRange(selectedRange, format)}
        <span className="arrow">▼</span>
      </div>
      
      {isDropdownOpen && (
        <div className="dropdown-menu">
          <div className="presets">
            {presets.map((preset, idx) => (
              <button 
                key={idx} 
                onClick={() => handlePresetSelect(preset)}
                className={`preset ${selectedRange.startDate && 
                  isWithinInterval(new Date(), { 
                    start: selectedRange.startDate, 
                    end: selectedRange.endDate || new Date() 
                  }) ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className="custom-picker">
            <button onClick={() => setIsDropdownOpen(false)}>Custom</button>
            {/* Calendar or input fields would go here */}
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Optimized Component
export const MobileDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  presets = [
    { label: 'Today', range: () => ({ startDate: new Date(), endDate: new Date() }) },
    { label: 'Yesterday', range: () => ({ startDate: addDays(new Date(), -1), endDate: addDays(new Date(), -1) }) },
    { label: 'Last 7 Days', range: () => ({ startDate: addDays(new Date(), -6), endDate: new Date() }) },
    { label: 'Last 30 Days', range: () => ({ startDate: addDays(new Date(), -29), endDate: new Date() }) }
  ],
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>(value);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [adjustmentDays, setAdjustmentDays] = useState(7);

  const handleDateSelect = (date: Date) => {
    setSelectedRange(prev => {
      if (!prev.startDate) {
        return { ...prev, startDate: date };
      } else if (!prev.endDate) {
        return { ...prev, endDate: date };
      } else {
        return { startDate: date, endDate: null };
      }
    });
  };

  const handleApply = () => {
    onChange(selectedRange);
    setIsModalOpen(false);
  };

  const handleAdjustment = (increment: number) => {
    setSelectedRange(prev => {
      const newStart = addDays(prev.startDate || new Date(), increment);
      const newEnd = addDays(prev.endDate || new Date(), increment);
      return { startDate: newStart, endDate: newEnd };
    });
  };

  const renderCalendar = () => {
    return (
      <div className="mobile-calendar">
        <div className="month-header">
          <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>←</button>
          <span>{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>→</button>
        </div>
        
        <div className="weekdays">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="days">
          {Array.from({ length: 42 }, (_, i) => {
            const date = new Date(currentMonth);
            date.setDate(currentMonth.getDate() - currentMonth.getDay() + i + 1);
            const isOutsideMonth = date.getMonth() !== currentMonth.getMonth();
            const isStart = selectedRange.startDate?.toDateString() === date.toDateString();
            const isEnd = selectedRange.endDate?.toDateString() === date.toDateString();
            const isInRange = isWithinInterval(date, {
              start: selectedRange.startDate || new Date(0),
              end: selectedRange.endDate || new Date(0)
            });
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div 
                key={i}
                className={`day ${isOutsideMonth ? 'outside' : ''} 
                  ${isStart ? 'selected start' : ''}
                  ${isEnd ? 'selected end' : ''}
                  ${isInRange ? 'in-range' : ''}
                  ${isToday ? 'today' : ''}`}
                onClick={() => !isOutsideMonth && handleDateSelect(date)}
              >
                <div className="day-number">{date.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`mobile-datepicker ${className}`}>
      <div className="selected-range">
        {dateUtils.formatRange(selectedRange, 'PPP')}
        {dateUtils.getTodayDot(selectedRange)}
      </div>
      
      <button 
        className="open-picker"
        onClick={() => setIsModalOpen(true)}
      >
        Select Date Range
      </button>
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>Selected Range: {dateUtils.formatRange(selectedRange)}</span>
              <button onClick={() => setIsModalOpen(false)}>Done</button>
            </div>
            
            <div className="presets">
              {presets.map((preset, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    const range = preset.range();
                    setSelectedRange(range);
                    onChange(range);
                  }}
                  className={`preset ${selectedRange.startDate && 
                    isWithinInterval(new Date(), { 
                      start: selectedRange.startDate, 
                      end: selectedRange.endDate || new Date() 
                    }) ? 'active' : ''}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            <div className="adjustment-controls">
              <button onClick={() => handleAdjustment(-adjustmentDays)}>← {adjustmentDays} days</button>
              <button onClick={() => handleAdjustment(adjustmentDays)}>{adjustmentDays} days →</button>
              <input 
                type="number" 
                value={adjustmentDays} 
                onChange={(e) => setAdjustmentDays(parseInt(e.target.value) || 7)}
                min="1"
              />
            </div>
            
            {renderCalendar()}
            
            <div className="modal-footer">
              <button onClick={() => setSelectedRange({ startDate: null, endDate: null })}>Clear</button>
              <button onClick={handleApply}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Export for All Date Pickers
export { 
  ClassicDatePicker,
  MinimalDatePicker,
  DualDatePicker,
  TimelineDatePicker,
  PillDatePicker,
  MobileDatePicker,
  dateUtils
};