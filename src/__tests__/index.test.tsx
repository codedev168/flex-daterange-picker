import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  dateUtils,
  ClassicDatePicker,
  MinimalDatePicker,
  DualDatePicker,
  TimelineDatePicker,
  PillDatePicker,
  MobileDatePicker
} from '../index.js';

describe('Date Utils', () => {
  describe('isValidRange', () => {
    it('should return true for valid range', () => {
      const range = {
        startDate: new Date(2026, 3, 1),
        endDate: new Date(2026, 3, 10)
      };
      expect(dateUtils.isValidRange(range)).toBe(true);
    });

    it('should return false for invalid range (start after end)', () => {
      const range = {
        startDate: new Date(2026, 3, 10),
        endDate: new Date(2026, 3, 1)
      };
      expect(dateUtils.isValidRange(range)).toBe(false);
    });

    it('should return false for null dates', () => {
      const range = {
        startDate: null,
        endDate: new Date(2026, 3, 10)
      };
      expect(dateUtils.isValidRange(range)).toBe(false);
    });
  });

  describe('parseRelativeDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 3, 15));
    });

    it('should parse days correctly', () => {
      const date = dateUtils.parseRelativeDate('3d');
      expect(date).toEqual(new Date(2026, 3, 18));
    });

    it('should parse weeks correctly', () => {
      const date = dateUtils.parseRelativeDate('2w');
      expect(date).toEqual(new Date(2026, 3, 29));
    });

    it('should parse months correctly', () => {
      const date = dateUtils.parseRelativeDate('1m');
      expect(date).toEqual(new Date(2026, 4, 15));
    });

    it('should return base date for invalid input', () => {
      const date = dateUtils.parseRelativeDate('invalid');
      expect(date).toEqual(new Date(2026, 3, 15));
    });
  });

  describe('formatRange', () => {
    it('should format valid range', () => {
      const range = {
        startDate: new Date(2026, 3, 1),
        endDate: new Date(2026, 3, 10)
      };
      expect(dateUtils.formatRange(range)).toBe('Apr 1, 2026 – Apr 10, 2026');
    });

    it('should return empty string for null dates', () => {
      const range = { startDate: null, endDate: null };
      expect(dateUtils.formatRange(range)).toBe('');
    });
  });
});

describe('ClassicDatePicker', () => {
  it('should render with default presets', () => {
    const onChange = vi.fn();
    const wrapper = document.createElement('div');
    const datePicker = new ClassicDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    datePicker.render(wrapper);
    
    expect(wrapper.innerHTML).toContain('Today');
    expect(wrapper.innerHTML).toContain('Yesterday');
    expect(wrapper.innerHTML).toContain('Last 7 Days');
  });

  it('should select dates correctly', () => {
    const onChange = vi.fn();
    const datePicker = new ClassicDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handleSelectDate(new Date(2026, 3, 1));
    expect(datePicker.state.selectedRange.startDate).toEqual(new Date(2026, 3, 1));
    
    datePicker.handleSelectDate(new Date(2026, 3, 10));
    expect(datePicker.state.selectedRange.endDate).toEqual(new Date(2026, 3, 10));
  });

  it('should apply and clear selections', () => {
    const onChange = vi.fn();
    const datePicker = new ClassicDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handleSelectDate(new Date(2026, 3, 1));
    datePicker.handleSelectDate(new Date(2026, 3, 10));
    datePicker.handleApply();
    expect(onChange).toHaveBeenCalledWith({
      startDate: new Date(2026, 3, 1),
      endDate: new Date(2026, 3, 10)
    });
    
    datePicker.handleClear();
    expect(onChange).toHaveBeenCalledWith({ startDate: null, endDate: null });
  });

  it('should select presets correctly', () => {
    const onChange = vi.fn();
    const datePicker = new ClassicDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handlePresetSelect(datePicker.props.presets[0]);
    expect(onChange).toHaveBeenCalledWith({
      startDate: new Date(),
      endDate: new Date()
    });
  });
});

describe('MinimalDatePicker', () => {
  it('should parse date input correctly', () => {
    const onChange = vi.fn();
    const datePicker = new MinimalDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handleInputChange({ target: { value: '3d' } });
    expect(datePicker.state.selectedRange.startDate).toEqual(
      new Date(new Date().setDate(new Date().getDate() - 3))
    );
  });

  it('should apply and clear selections', () => {
    const onChange = vi.fn();
    const datePicker = new MinimalDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handleInputChange({ target: { value: '3d' } });
    datePicker.handleApply();
    expect(onChange).toHaveBeenCalled();
    
    datePicker.handleClear();
    expect(onChange).toHaveBeenCalledWith({ startDate: null, endDate: null });
  });
});

describe('DualDatePicker', () => {
  it('should select dates correctly', () => {
    const onChange = vi.fn();
    const datePicker = new DualDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handleDateSelect(new Date(2026, 3, 1));
    expect(datePicker.state.selectedRange.startDate).toEqual(new Date(2026, 3, 1));
    
    datePicker.handleDateSelect(new Date(2026, 3, 10));
    expect(datePicker.state.selectedRange.endDate).toEqual(new Date(2026, 3, 10));
  });

  it('should apply and clear selections', () => {
    const onChange = vi.fn();
    const datePicker = new DualDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handleDateSelect(new Date(2026, 3, 1));
    datePicker.handleDateSelect(new Date(2026, 3, 10));
    datePicker.handleApply();
    expect(onChange).toHaveBeenCalledWith({
      startDate: new Date(2026, 3, 1),
      endDate: new Date(2026, 3, 10)
    });
    
    datePicker.handleClear();
    expect(onChange).toHaveBeenCalledWith({ startDate: null, endDate: null });
  });
});

describe('TimelineDatePicker', () => {
  it('should change view mode', () => {
    const onChange = vi.fn();
    const datePicker = new TimelineDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handleDateChange(new Date(2026, 3, 1), new Date(2026, 3, 10));
    expect(datePicker.state.selectedRange).toEqual({
      startDate: new Date(2026, 3, 1),
      endDate: new Date(2026, 3, 10)
    });
  });
});

describe('PillDatePicker', () => {
  it('should select presets correctly', () => {
    const onChange = vi.fn();
    const datePicker = new PillDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handlePresetSelect(datePicker.props.presets[0]);
    expect(onChange).toHaveBeenCalledWith({
      startDate: new Date(),
      endDate: new Date()
    });
  });
});

describe('MobileDatePicker', () => {
  it('should select dates correctly', () => {
    const onChange = vi.fn();
    const datePicker = new MobileDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handleDateSelect(new Date(2026, 3, 1));
    expect(datePicker.state.selectedRange.startDate).toEqual(new Date(2026, 3, 1));
    
    datePicker.handleDateSelect(new Date(2026, 3, 10));
    expect(datePicker.state.selectedRange.endDate).toEqual(new Date(2026, 3, 10));
  });

  it('should apply and clear selections', () => {
    const onChange = vi.fn();
    const datePicker = new MobileDatePicker({
      value: { startDate: null, endDate: null },
      onChange,
    });
    
    datePicker.handleDateSelect(new Date(2026, 3, 1));
    datePicker.handleDateSelect(new Date(2026, 3, 10));
    datePicker.handleApply();
    expect(onChange).toHaveBeenCalledWith({
      startDate: new Date(2026, 3, 1),
      endDate: new Date(2026, 3, 10)
    });
    
    datePicker.handleClear();
    expect(onChange).toHaveBeenCalledWith({ startDate: null, endDate: null });
  });
});