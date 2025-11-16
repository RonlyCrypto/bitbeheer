import React, { useState, useRef, useEffect } from 'react';

interface ChartTimelineSliderProps {
  allData: Array<{ date: string; timestamp: number; price?: number }>;
  onRangeChange: (startDate: string, endDate: string) => void;
  currentStartDate: string;
  currentEndDate: string;
  height?: number;
}

/**
 * Interactive Range Slider for chart timeline
 * - Grey background bar = full data range
 * - Blue selection bar = current view range
 * - Draggable to move or resize selection
 */
export default function ChartTimelineSlider({
  allData,
  onRangeChange,
  currentStartDate,
  currentEndDate,
  height = 40
}: ChartTimelineSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'left' | 'right' | 'middle' | null>(null);
  const [sliderWidth, setSliderWidth] = useState(0);

  // Calculate positions
  const getDateIndex = (date: string) => {
    return allData.findIndex(d => d.date === date);
  };

  const startIdx = getDateIndex(currentStartDate);
  const endIdx = getDateIndex(currentEndDate);
  const totalDays = allData.length - 1;

  const startPercent = (startIdx / totalDays) * 100;
  const endPercent = ((endIdx + 1) / totalDays) * 100;
  const selectionWidth = endPercent - startPercent;

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent, part: 'left' | 'right' | 'middle') => {
    e.preventDefault();
    setIsDragging(part);
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const dayIndex = Math.round((percent / 100) * totalDays);

      if (isDragging === 'left') {
        // Move left edge
        if (dayIndex < endIdx) {
          onRangeChange(allData[dayIndex].date, currentEndDate);
        }
      } else if (isDragging === 'right') {
        // Move right edge
        if (dayIndex > startIdx) {
          onRangeChange(currentStartDate, allData[dayIndex].date);
        }
      } else if (isDragging === 'middle') {
        // Move entire selection
        const rangeSize = endIdx - startIdx;
        const newStartIdx = Math.max(0, Math.min(dayIndex - Math.floor(rangeSize / 2), totalDays - rangeSize));
        const newEndIdx = newStartIdx + rangeSize;
        onRangeChange(allData[newStartIdx].date, allData[newEndIdx].date);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, allData, currentStartDate, currentEndDate, startIdx, endIdx, totalDays, onRangeChange]);

  return (
    <div className="mt-6 mb-4">
      <div
        ref={sliderRef}
        className="relative w-full bg-gray-200 rounded cursor-pointer"
        style={{ height: `${height}px` }}
      >
        {/* Grey background (full range) */}
        <div className="absolute inset-0 bg-gray-300 rounded opacity-30" />

        {/* Blue selection bar */}
        <div
          className="absolute top-0 h-full bg-blue-500 rounded cursor-grab active:cursor-grabbing transition-opacity hover:opacity-90"
          style={{
            left: `${startPercent}%`,
            width: `${selectionWidth}%`,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'middle')}
        >
          {/* Left resize handle */}
          <div
            className="absolute -left-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-600 rounded-l group"
            onMouseDown={(e) => handleMouseDown(e, 'left')}
            title="Drag to resize left"
          >
            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-6 bg-white rounded" />
            </div>
          </div>

          {/* Right resize handle */}
          <div
            className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-600 rounded-r group"
            onMouseDown={(e) => handleMouseDown(e, 'right')}
            title="Drag to resize right"
          >
            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-6 bg-white rounded" />
            </div>
          </div>
        </div>

        {/* Date labels */}
        <div className="absolute inset-x-0 bottom-1 flex justify-between px-2 text-xs text-gray-600 pointer-events-none">
          <span>{allData[0]?.date}</span>
          <span>{allData[allData.length - 1]?.date}</span>
        </div>
      </div>

      {/* Current range display */}
      <div className="mt-2 text-center text-xs text-gray-600">
        <span className="font-medium">Zichtbaar bereik:</span> {currentStartDate} tot {currentEndDate}
      </div>
    </div>
  );
}

