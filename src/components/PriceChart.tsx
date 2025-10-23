import { useEffect, useRef, useState } from 'react';
import { PriceData, HalvingEvent } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';

interface CyclePhase {
  start: string;
  end: string;
  priceRange: string;
  type: 'accumulation' | 'bullRun' | 'bearMarket';
  cycleId?: string;
  isSelected?: boolean;
}

interface PriceChartProps {
  data: PriceData[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  color?: string;
  purchasePoints?: { date: string; price: number }[];
  averageBuyPrice?: number;
  minMaxLines?: {
    min: { price: number; date: string };
    max: { price: number; date: string };
  };
  halvingEvents?: HalvingEvent[];
  purchaseDetails?: {
    date: string;
    amount: number;
    price: number;
    btcAcquired: number;
    monthNumber: number;
    currentValue: number;
  }[];
  cyclePhases?: CyclePhase[];
  selectedPhases?: {
    accumulation: boolean;
    bullRun: boolean;
    bearMarket: boolean;
  };
  showZoomControls?: boolean;
  showMetricToggle?: boolean;
  showZoomSlider?: boolean;
  onZoomChange?: (startDate: string, endDate: string) => void;
  onMetricChange?: (metric: 'price' | 'marketCap') => void;
  onTimeRangeChange?: (range: '1y' | '3y' | '5y' | 'all' | 'live') => void;
  currentTimeRange?: '1y' | '3y' | '5y' | 'all' | 'live';
  isLiveMode?: boolean;
  lastUpdateTime?: Date | null;
}

export default function PriceChart({
  data,
  title,
  height = 300,
  showGrid = true,
  color = '#f97316',
  purchasePoints = [],
  averageBuyPrice,
  minMaxLines,
  halvingEvents = [],
  purchaseDetails = [],
  cyclePhases = [],
  selectedPhases,
  showZoomControls = false,
  showMetricToggle = false,
  showZoomSlider = false,
  onZoomChange,
  onMetricChange,
  onTimeRangeChange,
  currentTimeRange = 'all',
  isLiveMode = false,
  lastUpdateTime = null
}: PriceChartProps) {
  const { getCurrencySymbol, formatPrice } = useCurrency();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ 
    x: number; 
    y: number; 
    date: string; 
    price: number;
    isPurchase?: boolean;
    purchaseDetail?: {
      date: string;
      amount: number;
      price: number;
      btcAcquired: number;
      monthNumber: number;
      currentValue: number;
    };
  } | null>(null);
  const [zoomRange, setZoomRange] = useState<{ start: number; end: number }>({ start: 0, end: 100 });
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'range' | null>(null);
  const [isManualZoom, setIsManualZoom] = useState(false);

  // Function to zoom to a specific phase
  const zoomToPhase = (phase: CyclePhase) => {
    if (data.length === 0) return;
    
    console.log('Zooming to phase:', phase);
    console.log('Data length:', data.length);
    console.log('Data start:', data[0].date);
    console.log('Data end:', data[data.length - 1].date);
    
    const dataStartDate = new Date(data[0].date);
    const dataEndDate = new Date(data[data.length - 1].date);
    const phaseStartDate = new Date(phase.start);
    const phaseEndDate = new Date(phase.end);
    
    console.log('Data start date:', dataStartDate);
    console.log('Data end date:', dataEndDate);
    console.log('Phase start date:', phaseStartDate);
    console.log('Phase end date:', phaseEndDate);
    
    // Calculate the percentage positions for the phase
    const totalTime = dataEndDate.getTime() - dataStartDate.getTime();
    const startTimeDiff = Math.max(0, phaseStartDate.getTime() - dataStartDate.getTime());
    const endTimeDiff = Math.min(dataEndDate.getTime() - dataStartDate.getTime(), phaseEndDate.getTime() - dataStartDate.getTime());
    
    const startPercent = (startTimeDiff / totalTime) * 100;
    const endPercent = (endTimeDiff / totalTime) * 100;
    
    console.log('Start percent:', startPercent);
    console.log('End percent:', endPercent);
    
    // Set the zoom range to the phase
    setZoomRange({ start: startPercent, end: endPercent });
    setIsManualZoom(true);
    
    // Call onZoomChange to update the parent component (but don't filter data)
    onZoomChange?.(phase.start, phase.end);
  };

  // Update zoom range when data changes or when cycle changes (but not during manual zoom)
  useEffect(() => {
    if (!isManualZoom && data.length > 0) {
      setZoomRange({ start: 0, end: 100 });
    }
  }, [data, isManualZoom]);

  // Update zoom range when cycle phases change
  useEffect(() => {
    if (cyclePhases && cyclePhases.length > 0 && data.length > 0) {
      // Set cycle zoom state (not manual zoom, but also not "all" view)
      setIsManualZoom(true); // This will make "Alles" button gray
      
      // Reset zoom slider to full range (0-100%) for manual zooming within cycle
      setZoomRange({ start: 0, end: 100 });
    }
  }, [cyclePhases, data]);

  // Function to generate dynamic x-axis labels based on zoom level
  const generateXAxisLabels = (data: PriceData[], chartWidth: number) => {
    if (data.length === 0) return [];
    
    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const labels: { x: number; text: string; type: 'year' | 'month' | 'day' }[] = [];
    
    // Determine label frequency based on zoom level
    let labelInterval: number;
    let labelType: 'year' | 'month' | 'day';
    
    if (totalDays > 365 * 3) {
      // Show years
      labelInterval = Math.max(1, Math.floor(data.length / 8));
      labelType = 'year';
    } else if (totalDays > 90) {
      // Show months
      labelInterval = Math.max(1, Math.floor(data.length / 12));
      labelType = 'month';
    } else {
      // Show days
      labelInterval = Math.max(1, Math.floor(data.length / 10));
      labelType = 'day';
    }
    
    for (let i = 0; i < data.length; i += labelInterval) {
      const date = new Date(data[i].date);
      const x = (i / (data.length - 1)) * chartWidth;
      
      let text: string;
      switch (labelType) {
        case 'year':
          text = date.getFullYear().toString();
          break;
        case 'month':
          text = date.toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' });
          break;
        case 'day':
          text = date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
          break;
      }
      
      labels.push({ x, text, type: labelType });
    }
    
    return labels;
  };
  

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    
    console.log('=== PRICECHART RECEIVED PROPS ===');
    console.log('Data length:', data.length);
    console.log('Purchase points length:', purchasePoints.length);
    console.log('Purchase details length:', purchaseDetails.length);
    console.log('Purchase points:', purchasePoints);
    console.log('Purchase details:', purchaseDetails);
    console.log('Data sample (first 3):', data.slice(0, 3));
    console.log('Data sample (last 3):', data.slice(-3));
    console.log('=== END PRICECHART PROPS ===');

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Filter data based on zoom range for display only
    const startIndex = Math.floor((zoomRange.start / 100) * (data.length - 1));
    const endIndex = Math.ceil((zoomRange.end / 100) * (data.length - 1));
    const visibleData = data.slice(startIndex, endIndex + 1);

    ctx.clearRect(0, 0, rect.width, height);

    // Calculate price range for visible data only
    const prices = visibleData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;

      // Y-axis grid lines and labels
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();

        const price = maxPrice - (priceRange / 5) * i;
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        const formattedPrice = formatPrice(price);
        ctx.fillText(formattedPrice, padding.left - 10, y + 4);
      }

      // X-axis grid lines and labels
      const xAxisLabels = generateXAxisLabels(data, chartWidth);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      xAxisLabels.forEach(label => {
        const x = padding.left + label.x;
        
        // Draw vertical grid line
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label.text, x, padding.top + chartHeight + 20);
      });
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    visibleData.forEach((point, index) => {
      const x = padding.left + (index / (visibleData.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding.left + (index / (data.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();

    // X-axis labels are now handled by generateXAxisLabels function below

    // Year labels are now handled by generateXAxisLabels function below

    if (averageBuyPrice !== undefined) {
      const avgY = padding.top + chartHeight - ((averageBuyPrice - minPrice) / priceRange) * chartHeight;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, avgY);
      ctx.lineTo(padding.left + chartWidth, avgY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Gem: €${averageBuyPrice.toFixed(0)}`, padding.left - 10, avgY - 5);
    }

    // Draw min/max lines
    if (minMaxLines) {
      // Min line
      const minY = padding.top + chartHeight - ((minMaxLines.min.price - minPrice) / priceRange) * chartHeight;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, minY);
      ctx.lineTo(padding.left + chartWidth, minY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      const minFormatted = minMaxLines.min.price < 1 
        ? minMaxLines.min.price.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
        : minMaxLines.min.price < 10
        ? minMaxLines.min.price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
        : minMaxLines.min.price < 100
        ? minMaxLines.min.price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : minMaxLines.min.price.toLocaleString('nl-NL', { maximumFractionDigits: 0 });
      ctx.fillText(`Min: $${minFormatted}`, padding.left - 10, minY - 5);

      // Max line
      const maxY = padding.top + chartHeight - ((minMaxLines.max.price - minPrice) / priceRange) * chartHeight;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, maxY);
      ctx.lineTo(padding.left + chartWidth, maxY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      const maxFormatted = minMaxLines.max.price < 1 
        ? minMaxLines.max.price.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
        : minMaxLines.max.price < 10
        ? minMaxLines.max.price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
        : minMaxLines.max.price < 100
        ? minMaxLines.max.price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : minMaxLines.max.price.toLocaleString('nl-NL', { maximumFractionDigits: 0 });
      ctx.fillText(`Max: $${maxFormatted}`, padding.left - 10, maxY + 15);
    }

    if (purchasePoints.length > 0) {
      console.log('=== DRAWING PURCHASE POINTS ===');
      console.log('Total purchase points to draw:', purchasePoints.length);
      console.log('Purchase points data:', purchasePoints);
      console.log('Data range:', { startIndex, endIndex, dataLength: data.length });
      console.log('Visible data range:', { startDate: visibleData[0]?.date, endDate: visibleData[visibleData.length - 1]?.date });
      
      let drawnCount = 0;
      purchasePoints.forEach((purchase, index) => {
        // Try exact date match first
        let dataIndex = data.findIndex(d => d.date === purchase.date);
        console.log(`Purchase ${index + 1}:`, { date: purchase.date, dataIndex, found: dataIndex !== -1 });
        
        // If exact match fails, try to find closest date
        if (dataIndex === -1) {
          console.log(`Exact date match failed for ${purchase.date}, trying closest date...`);
          const purchaseDate = new Date(purchase.date);
          let closestIndex = -1;
          let minDiff = Infinity;
          
          data.forEach((d, i) => {
            const dataDate = new Date(d.date);
            const diff = Math.abs(dataDate.getTime() - purchaseDate.getTime());
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = i;
            }
          });
          
          if (closestIndex !== -1) {
            dataIndex = closestIndex;
            console.log(`Found closest date match at index ${dataIndex} for ${purchase.date}`);
          }
        }
        
        if (dataIndex !== -1) {
          // Check if this purchase point is within the visible zoom range
          const isVisible = dataIndex >= startIndex && dataIndex <= endIndex;
          console.log(`Purchase ${index + 1} visibility:`, { dataIndex, startIndex, endIndex, isVisible });
          
          if (!isVisible) {
            console.log(`Skipping purchase ${index + 1} - not visible in zoom range`);
            return; // Skip if not visible in current zoom
          }
          
          // Calculate position relative to visible data
          const visibleDataIndex = dataIndex - startIndex;
          const x = padding.left + (visibleDataIndex / (visibleData.length - 1)) * chartWidth;
          const y = padding.top + chartHeight - ((purchase.price - minPrice) / priceRange) * chartHeight;

          console.log(`Drawing purchase point ${index + 1}:`, {
            date: purchase.date,
            price: purchase.price,
            x: x,
            y: y,
            dataIndex: dataIndex,
            visibleDataIndex: visibleDataIndex,
            isVisible: isVisible
          });

          // Draw purchase point with arrow pointing up
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = '#10b981';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Draw arrow pointing up from the point
          ctx.beginPath();
          ctx.moveTo(x, y - 10);
          ctx.lineTo(x - 6, y - 20);
          ctx.lineTo(x + 6, y - 20);
          ctx.closePath();
          ctx.fillStyle = '#10b981';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Add inner white dot for better visibility
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          
          // Add purchase number above the arrow
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`#${index + 1}`, x, y - 25);
          
          drawnCount++;
          console.log(`Successfully drew purchase point ${index + 1} at position:`, { x, y });
        } else {
          console.log(`Purchase ${index + 1} not found in data - date: ${purchase.date}`);
        }
      });
      console.log(`=== FINISHED DRAWING PURCHASE POINTS - Drew ${drawnCount} out of ${purchasePoints.length} ===`);
    } else {
      console.log('=== NO PURCHASE POINTS TO DRAW ===');
    }

    // Draw cycle phases as background areas
    if (cyclePhases.length > 0) {
      const dataStartDate = new Date(visibleData[0].date);
      const dataEndDate = new Date(visibleData[visibleData.length - 1].date);
      
      // Check if we have phase selection
      const hasSelection = selectedPhases && (selectedPhases.accumulation || selectedPhases.bullRun || selectedPhases.bearMarket);
      
      cyclePhases.forEach((phase) => {
        const phaseStartDate = new Date(phase.start);
        const phaseEndDate = new Date(phase.end);
        
        // Only draw if phase is within visible data range
        if (phaseStartDate <= dataEndDate && phaseEndDate >= dataStartDate) {
          const startTimeDiff = Math.max(0, phaseStartDate.getTime() - dataStartDate.getTime());
          const endTimeDiff = Math.min(dataEndDate.getTime() - dataStartDate.getTime(), phaseEndDate.getTime() - dataStartDate.getTime());
          const totalTime = dataEndDate.getTime() - dataStartDate.getTime();
          
          const startX = padding.left + (startTimeDiff / totalTime) * chartWidth;
          const endX = padding.left + (endTimeDiff / totalTime) * chartWidth;
          
          // Set colors based on phase type
          let phaseColor: string;
          let phaseLabel: string;
          
          switch (phase.type) {
            case 'accumulation':
              phaseColor = '#3b82f6'; // Blue
              phaseLabel = 'ACCUMULATIE';
              break;
            case 'bullRun':
              phaseColor = '#10b981'; // Green
              phaseLabel = 'BULL RUN';
              break;
            case 'bearMarket':
              phaseColor = '#ef4444'; // Red
              phaseLabel = 'BEAR MARKET';
              break;
            default:
              phaseColor = '#6b7280'; // Gray
              phaseLabel = 'PHASE';
          }
          
              // Check if this phase should be highlighted
              const shouldHighlight = !hasSelection || (
                (phase.type === 'accumulation' && selectedPhases.accumulation) ||
                (phase.type === 'bullRun' && selectedPhases.bullRun) ||
                (phase.type === 'bearMarket' && selectedPhases.bearMarket)
              );
              
              // Check if this is a selected cycle phase
              const isSelectedCycle = phase.isSelected;
              
              // Draw background area with different opacity based on selection and cycle
              let opacity = '05'; // Default 5% opacity
              if (shouldHighlight) {
                opacity = '15'; // 15% opacity for selected phases
              } else if (isSelectedCycle) {
                opacity = '10'; // 10% opacity for selected cycle phases
              }
              
              ctx.fillStyle = phaseColor + opacity;
          ctx.fillRect(startX, padding.top, endX - startX, chartHeight);
          
          // Draw phase border
          ctx.strokeStyle = phaseColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(startX, padding.top, endX - startX, chartHeight);
          
          // Draw phase label at the top
          ctx.fillStyle = phaseColor;
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          const labelX = startX + (endX - startX) / 2;
          ctx.fillText(phaseLabel, labelX, padding.top - 8);
          
          // Draw price range info
          ctx.font = '9px sans-serif';
          ctx.fillText(phase.priceRange, labelX, padding.top + chartHeight + 15);
        }
      });
    }

    // Draw halving events as vertical lines
    if (halvingEvents.length > 0) {
      halvingEvents.forEach((halving) => {
        const halvingDate = new Date(halving.date);
        const dataStartDate = new Date(visibleData[0].date);
        const dataEndDate = new Date(visibleData[visibleData.length - 1].date);
        
        // Only draw if halving is within visible data range
        if (halvingDate >= dataStartDate && halvingDate <= dataEndDate) {
          const timeDiff = halvingDate.getTime() - dataStartDate.getTime();
          const totalTime = dataEndDate.getTime() - dataStartDate.getTime();
          const x = padding.left + (timeDiff / totalTime) * chartWidth;
          
          // Draw vertical line
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(x, padding.top);
          ctx.lineTo(x, padding.top + chartHeight);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw halving label
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('HALVING', x, padding.top - 5);
        }
      });
    }

  }, [data, height, showGrid, color, purchasePoints, averageBuyPrice, minMaxLines, halvingEvents, purchaseDetails, cyclePhases]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (x < padding.left || x > padding.left + chartWidth ||
        y < padding.top || y > padding.top + chartHeight) {
      setHoveredPoint(null);
      return;
    }

    // First check if we're hovering over a purchase point
    if (purchasePoints.length > 0) {
      const prices = data.map(d => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      
      console.log('Checking hover over purchase points:', purchasePoints.length);
      
      for (let i = 0; i < purchasePoints.length; i++) {
        const purchase = purchasePoints[i];
        // Try exact date match first, then closest date
        let dataIndex = data.findIndex(d => d.date === purchase.date);
        
        if (dataIndex === -1) {
          // Try to find closest date
          const purchaseDate = new Date(purchase.date);
          let closestIndex = -1;
          let minDiff = Infinity;
          
          data.forEach((d, i) => {
            const dataDate = new Date(d.date);
            const diff = Math.abs(dataDate.getTime() - purchaseDate.getTime());
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = i;
            }
          });
          
          if (closestIndex !== -1) {
            dataIndex = closestIndex;
          }
        }
        
        if (dataIndex !== -1) {
          const purchaseX = padding.left + (dataIndex / (data.length - 1)) * chartWidth;
          const purchaseY = padding.top + chartHeight - ((purchase.price - minPrice) / priceRange) * chartHeight;
          
          // Check if mouse is within 20 pixels of the purchase point
          const distance = Math.sqrt((x - purchaseX) ** 2 + (y - purchaseY) ** 2);
          console.log(`Purchase ${i + 1} hover check:`, { 
            mouseX: x, mouseY: y, 
            purchaseX, purchaseY, 
            distance, threshold: 20 
          });
          
          if (distance <= 20) {
            // Find the corresponding purchase details
            const purchaseDetail = purchaseDetails.find(p => p.date === purchase.date);
            if (purchaseDetail) {
              console.log('Hovering over purchase point:', purchaseDetail);
              setHoveredPoint({
                x: purchaseX,
                y: purchaseY,
                date: purchase.date,
                price: purchase.price,
                isPurchase: true,
                purchaseDetail: purchaseDetail
              });
              return;
            }
          }
        }
      }
    }

    // If not hovering over a purchase point, show regular price data
    const dataIndex = Math.round(((x - padding.left) / chartWidth) * (data.length - 1));
    const point = data[dataIndex];

    if (point) {
      // Calculate price range for this specific data
      const prices = data.map(d => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;

      const pointY = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;

      setHoveredPoint({
        x: padding.left + (dataIndex / (data.length - 1)) * chartWidth,
        y: pointY,
        date: point.date,
        price: point.price
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Mouse event handlers for zoom slider - support all three operations
  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !showZoomSlider) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    if (isDragging === 'start') {
      setZoomRange(prev => ({
        start: Math.min(percentage, prev.end - 2), // Minimum 2% range
        end: prev.end
      }));
    } else if (isDragging === 'end') {
      setZoomRange(prev => ({
        start: prev.start,
        end: Math.max(percentage, prev.start + 2) // Minimum 2% range
      }));
    } else if (isDragging === 'range') {
      // Only allow range dragging (moving the entire selection)
      const rangeWidth = zoomRange.end - zoomRange.start;
      const newStart = Math.max(0, Math.min(100 - rangeWidth, percentage - rangeWidth / 2));
      setZoomRange({
        start: newStart,
        end: newStart + rangeWidth
      });
    }
  };

  const handleSliderMouseUp = () => {
    if (isDragging && data.length > 0) {
      const startIndex = Math.floor((zoomRange.start / 100) * (data.length - 1));
      const endIndex = Math.floor((zoomRange.end / 100) * (data.length - 1));
      
      setIsManualZoom(true);
      onZoomChange?.(data[startIndex].date, data[endIndex].date);
    }
    setIsDragging(null);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        )}
        {isLiveMode && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live</span>
            {lastUpdateTime && (
              <span className="text-gray-500">
                ({lastUpdateTime.toLocaleTimeString('nl-NL')})
              </span>
            )}
          </div>
        )}
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: `${height}px` }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair"
        />
        {hoveredPoint && (
          <div
                className="absolute bg-gradient-to-br from-gray-800 to-gray-900 text-white px-4 py-3 rounded-xl text-sm pointer-events-none shadow-2xl max-w-xs border border-gray-600"
            style={{
              left: `${hoveredPoint.x}px`,
                  top: `${hoveredPoint.y - 100}px`,
              transform: 'translateX(-50%)'
            }}
          >
                {/* Arrow pointing down */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                
                {/* Price header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="font-bold text-lg">
                    {formatPrice(hoveredPoint.price)}
                  </div>
                </div>
                
                {/* Date */}
                <div className="text-gray-300 text-xs mb-3">
              {new Date(hoveredPoint.date).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
                
                {/* Purchase details */}
                {hoveredPoint.isPurchase && hoveredPoint.purchaseDetail && (
                  <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <div className="text-green-400 font-semibold text-xs">Inkoop #{hoveredPoint.purchaseDetail.monthNumber}</div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ingelegd:</span>
                        <span className="text-white font-medium">€{hoveredPoint.purchaseDetail.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">BTC Gekocht:</span>
                        <span className="text-white font-medium">{hoveredPoint.purchaseDetail.btcAcquired.toFixed(8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Prijs:</span>
                        <span className="text-white font-medium">{formatPrice(hoveredPoint.purchaseDetail.price)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-600">
                        <span className="text-gray-300">Huidige Waarde:</span>
                        <span className="text-green-400 font-medium">{formatPrice(hoveredPoint.purchaseDetail.currentValue)}</span>
                      </div>
                    </div>
                  </div>
                )}
          </div>
        )}
      </div>
      

      {/* Market Phase Navigator - Only for DCA charts */}
      {showZoomSlider && data.length > 0 && cyclePhases && cyclePhases.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Market Phase Navigator:</label>
            
            {/* Market Phase Buttons */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {/* Alles button */}
              <button
                onClick={() => {
                  // Reset to full view when "Alles" is clicked
                  setIsManualZoom(false);
                  setZoomRange({ start: 0, end: 100 });
                  onTimeRangeChange?.('all');
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  !isManualZoom && zoomRange.start === 0 && zoomRange.end === 100
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                Alles
              </button>
              
              {/* Market Phase Buttons */}
              {cyclePhases && cyclePhases.length > 0 && (() => {
                // Get phases that are within the current data range
                const dataStartDate = new Date(data[0].date);
                const dataEndDate = new Date(data[data.length - 1].date);
                
                const availablePhases = cyclePhases.filter(phase => {
                  const phaseStart = new Date(phase.start);
                  const phaseEnd = new Date(phase.end);
                  return phaseStart <= dataEndDate && phaseEnd >= dataStartDate;
                });

                // Group phases by type and count them
                const phaseGroups = availablePhases.reduce((acc, phase) => {
                  if (!acc[phase.type]) {
                    acc[phase.type] = [];
                  }
                  acc[phase.type].push(phase);
                  return acc;
                }, {} as Record<string, any[]>);

                return Object.entries(phaseGroups).map(([type, phases]) => {
                  const phaseConfig = {
                    accumulation: { 
                      label: 'Accumulatie', 
                      color: 'blue', 
                      bgColor: 'bg-blue-100', 
                      textColor: 'text-blue-700', 
                      borderColor: 'border-blue-300',
                      hoverColor: 'hover:bg-blue-200',
                      inactiveBgColor: 'bg-gray-100',
                      inactiveTextColor: 'text-gray-500',
                      inactiveBorderColor: 'border-gray-300'
                    },
                    bullRun: { 
                      label: 'Bull Run', 
                      color: 'green', 
                      bgColor: 'bg-green-100', 
                      textColor: 'text-green-700', 
                      borderColor: 'border-green-300',
                      hoverColor: 'hover:bg-green-200',
                      inactiveBgColor: 'bg-gray-100',
                      inactiveTextColor: 'text-gray-500',
                      inactiveBorderColor: 'border-gray-300'
                    },
                    bearMarket: { 
                      label: 'Bear Market', 
                      color: 'red', 
                      bgColor: 'bg-red-100', 
                      textColor: 'text-red-700', 
                      borderColor: 'border-red-300',
                      hoverColor: 'hover:bg-red-200',
                      inactiveBgColor: 'bg-gray-100',
                      inactiveTextColor: 'text-gray-500',
                      inactiveBorderColor: 'border-gray-300'
                    }
                  }[type];

                  if (!phaseConfig) return null;

                  // Check if this phase type is currently active (simplified)
                  const isActive = isManualZoom && zoomRange.start > 0 && zoomRange.end < 100;

                  return (
                    <button
                      key={type}
                      onClick={() => {
                        // Find the first phase of this type
                        const targetPhase = phases[0];
                        if (!targetPhase) return;
                        
                        // Zoom to the target phase
                        const startDate = new Date(targetPhase.start);
                        const endDate = new Date(targetPhase.end);
                        
                        // Calculate zoom range based on phase dates
                        const dataStart = new Date(data[0].date);
                        const dataEnd = new Date(data[data.length - 1].date);
                        const totalRange = dataEnd.getTime() - dataStart.getTime();
                        const phaseStart = startDate.getTime() - dataStart.getTime();
                        const phaseEnd = endDate.getTime() - dataStart.getTime();
                        
                        const startPercent = Math.max(0, (phaseStart / totalRange) * 100);
                        const endPercent = Math.min(100, (phaseEnd / totalRange) * 100);
                        
                        setZoomRange({ start: startPercent, end: endPercent });
                        setIsManualZoom(true);
                        onTimeRangeChange?.('all');
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${
                        isActive
                          ? `${phaseConfig.bgColor} ${phaseConfig.textColor} ${phaseConfig.borderColor} ${phaseConfig.hoverColor}`
                          : `${phaseConfig.inactiveBgColor} ${phaseConfig.inactiveTextColor} ${phaseConfig.inactiveBorderColor} hover:bg-gray-200`
                      }`}
                    >
                      <span>{phaseConfig.label}</span>
                      {phases.length > 1 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                          isActive ? 'bg-white bg-opacity-50' : 'bg-gray-200'
                        }`}>
                          {phases.length}
                        </span>
                      )}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
          
          <div className="relative">
            {/* Background track - smaller for compact design */}
            <div 
              className="w-full h-6 bg-gray-200 rounded-lg relative cursor-pointer"
              onMouseMove={handleSliderMouseMove} 
              onMouseUp={handleSliderMouseUp}
              onMouseLeave={handleSliderMouseUp}
            >
              
              {/* Selected range - non-draggable background */}
              <div 
                className="absolute bg-blue-500 rounded-lg border-2 border-blue-600"
                style={{
                  left: `${zoomRange.start}%`,
                  width: `${zoomRange.end - zoomRange.start}%`,
                  height: '100%',
                  minHeight: '24px' // Keep minimum height for better visibility
                }}
              ></div>
              
              {/* Left resize handle */}
              <div
                className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full cursor-ew-resize hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg border-2 border-white"
                style={{
                  left: `${zoomRange.start}%`
                }}
                onMouseDown={() => setIsDragging('start')}
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              
              {/* Right resize handle */}
              <div
                className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full cursor-ew-resize hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg border-2 border-white"
                style={{
                  left: `${zoomRange.end}%`
                }}
                onMouseDown={() => setIsDragging('end')}
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              {/* Draggable center area with left-right drag icon */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full cursor-move hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg border-2 border-white"
                style={{
                  left: `${zoomRange.start + (zoomRange.end - zoomRange.start) / 2}%`
                }}
                onMouseDown={() => setIsDragging('range')}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
            
            {/* Date labels */}
            <div className="flex justify-between mt-3 text-sm text-gray-600 font-medium">
              <span className="bg-white px-2 py-1 rounded border">
                {new Date(data[Math.floor((zoomRange.start / 100) * (data.length - 1))].date).toLocaleDateString('nl-NL')}
              </span>
              <span className="bg-white px-2 py-1 rounded border">
                {new Date(data[Math.floor((zoomRange.end / 100) * (data.length - 1))].date).toLocaleDateString('nl-NL')}
              </span>
            </div>
            
            {/* Percentage labels */}
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{zoomRange.start.toFixed(1)}%</span>
              <span>{zoomRange.end.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
