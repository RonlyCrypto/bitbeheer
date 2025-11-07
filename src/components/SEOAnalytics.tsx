import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Users, 
  Clock, 
  Eye, 
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Globe,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Zap,
  Smartphone,
  Monitor,
  MapPin,
  Globe2,
  Languages,
  Activity,
  Map
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion?: string;
  page?: string;
}

interface AnalyticsData {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  avgSessionDuration: number;
  topPages: Array<{ path: string; views: number; avgDuration: number }>;
  referrers: Array<{ source: string; count: number }>;
  devices: Array<{ type: string; count: number }>;
  browsers: Array<{ name: string; count: number }>;
  timeSeriesData: Array<{ date: string; visitors: number; pageViews: number }>;
  countries: Array<{ country: string; country_code: string; count: number }>;
  cities: Array<{ city: string; country: string; count: number }>;
  languages: Array<{ language: string; count: number }>;
  hourlyData: Array<{ hour: number; visitors: number; pageViews: number }>;
  recentVisitors: Array<{
    id: string;
    ip_address?: string;
    country?: string;
    city?: string;
    page_path: string;
    visited_at: string;
    browser: string;
    device_type: string;
  }>;
}

type TimePeriod = 'day' | 'week' | 'month' | 'year';

export default function SEOAnalytics() {
  const [activeSubTab, setActiveSubTab] = useState<'seo' | 'analytics'>('seo');
  const [seoIssues, setSeoIssues] = useState<SEOIssue[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [recentVisitorsLimit, setRecentVisitorsLimit] = useState<number>(50);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBar, setHoveredBar] = useState<{ x: number; y: number; data: { date: string; visitors: number; pageViews: number } } | null>(null);

  useEffect(() => {
    if (activeSubTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeSubTab, timePeriod, selectedCity, selectedIp]);

  // Draw chart when data changes
  useEffect(() => {
    if (analyticsData?.timeSeriesData && chartCanvasRef.current) {
      drawChart();
    }
  }, [analyticsData?.timeSeriesData, timePeriod]);

  // Handle mouse move for tooltips
  const handleChartMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = chartCanvasRef.current;
    if (!canvas || !analyticsData?.timeSeriesData) {
      setHoveredBar(null);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const barPositions = (canvas as any).barPositions || [];
    const hovered = barPositions.find((bar: any) => {
      return x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height;
    });

    if (hovered) {
      setHoveredBar({
        x: e.clientX,
        y: e.clientY,
        data: hovered.data
      });
    } else {
      setHoveredBar(null);
    }
  };

  const handleChartMouseLeave = () => {
    setHoveredBar(null);
  };

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      // Load visitor analytics from database
      // For day view, get data from today only
      let query = supabase
        .from('visitor_analytics')
        .select('*')
        .order('visited_at', { ascending: false });
      
      if (timePeriod === 'day') {
        // Get data from the most recent day with data, or today
        // We'll filter after loading to get the most recent day
      }
      
      // Apply city filter
      if (selectedCity) {
        query = query.eq('city', selectedCity.split(',')[0].trim());
      }
      
      // Apply IP filter
      if (selectedIp) {
        query = query.eq('ip_address', selectedIp);
      }
      
      const { data: visits, error } = await query.limit(1000);

      if (error) {
        console.error('Error loading analytics:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        // If table doesn't exist, create sample data structure
        setAnalyticsData({
          totalVisitors: 0,
          uniqueVisitors: 0,
          pageViews: 0,
          avgSessionDuration: 0,
          topPages: [],
          referrers: [],
          devices: [],
          browsers: [],
          timeSeriesData: [],
          countries: [],
          cities: [],
          languages: [],
          hourlyData: [],
          recentVisitors: []
        });
        setIsLoadingAnalytics(false);
        return;
      }

      console.log('Loaded visits from database:', visits?.length || 0, 'visits');

      // Filter by day if needed (after loading to get most recent day)
      let filteredVisits = visits;
      if (timePeriod === 'day' && visits && visits.length > 0) {
        // Get the most recent day
        const allDays = new Set<string>();
        visits.forEach((visit: any) => {
          const dayStr = new Date(visit.visited_at).toISOString().split('T')[0];
          allDays.add(dayStr);
        });
        const targetDay = Array.from(allDays).sort().reverse()[0];
        const dayStart = new Date(targetDay);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(targetDay);
        dayEnd.setHours(23, 59, 59, 999);
        
        filteredVisits = visits.filter((visit: any) => {
          const visitDate = new Date(visit.visited_at);
          return visitDate >= dayStart && visitDate <= dayEnd;
        });
      }

      // Process analytics data
      const uniqueVisitors = new Set(filteredVisits?.map((v: any) => v.visitor_id || v.ip_address) || []);
      
      // Initialize Maps using Object.create to avoid constructor issues
      const pageViewsMap = Object.create(null) as Record<string, { views: number; durations: number[] }>;
      const referrerMap = Object.create(null) as Record<string, number>;
      const deviceMap = Object.create(null) as Record<string, number>;
      const browserMap = Object.create(null) as Record<string, number>;
      const countryMap = Object.create(null) as Record<string, { count: number; code: string }>;
      const cityMap = Object.create(null) as Record<string, { count: number; country: string }>;
      const languageMap = Object.create(null) as Record<string, number>;
      const hourlyMap = Object.create(null) as Record<number, { visitors: Set<string>; pageViews: number }>;
      const timeSeriesMap = Object.create(null) as Record<string, { visitors: Set<string>; pageViews: number }>;
      
      let totalDuration = 0;
      let durationCount = 0;

      filteredVisits?.forEach((visit: any) => {
        const visitDateTime = new Date(visit.visited_at);
        let timeKey = '';
        
        // Create time key based on period
        switch (timePeriod) {
          case 'day':
            // Per dag: groepeer per uur (0-23) - gebruik vandaag als referentie
            const hour = visitDateTime.getHours();
            // Gebruik de datum van de visit, maar normaliseer naar vandaag voor consistentie
            // Of gebruik de meest recente dag met data
            const dayStr = visitDateTime.toISOString().split('T')[0];
            timeKey = `${dayStr}-${String(hour).padStart(2, '0')}`; // YYYY-MM-DD-HH
            break;
          case 'week':
            // Per week: groepeer per dag (maandag = 1, zondag = 0)
            // JavaScript: 0 = zondag, 1 = maandag, etc.
            // We willen maandag = 0, dus: (day + 6) % 7
            const dayOfWeek = (visitDateTime.getDay() + 6) % 7; // 0 = maandag, 6 = zondag
            const weekStart = new Date(visitDateTime);
            weekStart.setDate(visitDateTime.getDate() - dayOfWeek); // Start of week (Monday)
            const weekStartStr = weekStart.toISOString().split('T')[0];
            timeKey = `${weekStartStr}-${dayOfWeek}`; // YYYY-MM-DD-0 (0=maandag, 6=zondag)
            break;
          case 'month':
            // Per maand: groepeer per week
            const monthStart = new Date(visitDateTime.getFullYear(), visitDateTime.getMonth(), 1);
            const daysSinceMonthStart = Math.floor((visitDateTime.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
            const weekInMonth = Math.floor(daysSinceMonthStart / 7);
            timeKey = `${visitDateTime.getFullYear()}-${String(visitDateTime.getMonth() + 1).padStart(2, '0')}-W${weekInMonth}`;
            break;
          case 'year':
            // Per jaar: groepeer per maand
            timeKey = `${visitDateTime.getFullYear()}-${String(visitDateTime.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            break;
        }

        // Aggregate time series data
        if (!timeSeriesMap[timeKey]) {
          timeSeriesMap[timeKey] = { visitors: new Set<string>(), pageViews: 0 };
        }
        timeSeriesMap[timeKey].visitors.add(visit.visitor_id || visit.ip_address || 'unknown');
        timeSeriesMap[timeKey].pageViews++;

        // Page views
        const path = visit.page_path || '/';
        if (!pageViewsMap[path]) {
          pageViewsMap[path] = { views: 0, durations: [] };
        }
        pageViewsMap[path].views++;
        if (visit.session_duration) {
          pageViewsMap[path].durations.push(visit.session_duration);
        }

        // Referrers
        const referrer = visit.referrer || 'Direct';
        referrerMap[referrer] = (referrerMap[referrer] || 0) + 1;

        // Devices
        const device = visit.device_type || 'Unknown';
        deviceMap[device] = (deviceMap[device] || 0) + 1;

        // Browsers
        const browser = visit.browser || 'Unknown';
        browserMap[browser] = (browserMap[browser] || 0) + 1;

        // Session duration
        if (visit.session_duration) {
          totalDuration += visit.session_duration;
          durationCount++;
        }

        // Countries
        if (visit.country) {
          if (!countryMap[visit.country]) {
            countryMap[visit.country] = { count: 0, code: visit.country_code || '' };
          }
          countryMap[visit.country].count++;
        }

        // Cities
        if (visit.city) {
          const key = `${visit.city}, ${visit.country || 'Unknown'}`;
          if (!cityMap[key]) {
            cityMap[key] = { count: 0, country: visit.country || 'Unknown' };
          }
          cityMap[key].count++;
        }

        // Languages
        if (visit.language) {
          const lang = visit.language.split('-')[0]; // Get base language (e.g., 'nl' from 'nl-NL')
          languageMap[lang] = (languageMap[lang] || 0) + 1;
        }

        // Hourly data
        const visitHourDate = new Date(visit.visited_at);
        const hour = visitHourDate.getHours();
        if (!hourlyMap[hour]) {
          hourlyMap[hour] = { visitors: new Set<string>(), pageViews: 0 };
        }
        hourlyMap[hour].visitors.add(visit.visitor_id || visit.ip_address || 'unknown');
        hourlyMap[hour].pageViews++;
      });

      // Convert time series map to array and sort, with proper labels
      let timeSeriesData: Array<{ date: string; dateKey: string; visitors: number; pageViews: number }> = [];
      
      if (timePeriod === 'day') {
        // For day view: show all 24 hours (00:00 to 23:59)
        // Get the most recent day with data, or use today
        const allDays = new Set<string>();
        visits?.forEach((visit: any) => {
          const dayStr = new Date(visit.visited_at).toISOString().split('T')[0];
          allDays.add(dayStr);
        });
        
        const targetDay = allDays.size > 0 
          ? Array.from(allDays).sort().reverse()[0] // Most recent day
          : new Date().toISOString().split('T')[0];
        
        // Initialize all 24 hours
        for (let hour = 0; hour < 24; hour++) {
          const hourKey = `${targetDay}-${String(hour).padStart(2, '0')}`;
          const hourData = timeSeriesMap[hourKey] || { visitors: new Set<string>(), pageViews: 0 };
          
          timeSeriesData.push({
            date: `${String(hour).padStart(2, '0')}:00`,
            dateKey: hourKey,
            visitors: hourData.visitors.size,
            pageViews: hourData.pageViews
          });
        }
      } else if (timePeriod === 'week') {
        // For week view: show Monday to Sunday with dates
        // Get all unique week starts from the data
        const weekStarts = new Set<string>();
        visits?.forEach((visit: any) => {
          const visitDateTime = new Date(visit.visited_at);
          const dayOfWeek = (visitDateTime.getDay() + 6) % 7; // 0 = maandag, 6 = zondag
          const weekStart = new Date(visitDateTime);
          weekStart.setDate(visitDateTime.getDate() - dayOfWeek);
          const weekStartStr = weekStart.toISOString().split('T')[0];
          weekStarts.add(weekStartStr);
        });
        
        // Use the most recent week, or current week
        const targetWeekStart = weekStarts.size > 0
          ? Array.from(weekStarts).sort().reverse()[0]
          : (() => {
              const now = new Date();
              const dayOfWeek = (now.getDay() + 6) % 7;
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - dayOfWeek);
              return weekStart.toISOString().split('T')[0];
            })();
        
        const weekStartDate = new Date(targetWeekStart);
        const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
        
        // Initialize all 7 days of the week
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const dayDate = new Date(weekStartDate);
          dayDate.setDate(weekStartDate.getDate() + dayIndex);
          const dateKey = `${targetWeekStart}-${dayIndex}`;
          const dayData = timeSeriesMap[dateKey] || { visitors: new Set<string>(), pageViews: 0 };
          
          const dayName = dayNames[dayIndex];
          const dateFormatted = dayDate.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' });
          
          timeSeriesData.push({
            date: `${dayName} ${dateFormatted}`,
            dateKey: dateKey,
            visitors: dayData.visitors.size,
            pageViews: dayData.pageViews
          });
        }
      } else {
        // For other periods (month, year): use existing logic
        timeSeriesData = Object.entries(timeSeriesMap)
          .map(([dateKey, data]) => {
            let displayDate = dateKey;
            let sortKey = dateKey;
            
            // Format display date based on period
            switch (timePeriod) {
              case 'month':
                // Format: "Week 1", "Week 2", etc.
                const [year, month, week] = dateKey.split('-');
                displayDate = `Week ${parseInt(week) + 1}`;
                sortKey = `${year}-${month}-${week}`;
                break;
              case 'year':
                // Format: "Januari", "Februari", etc.
                const [, monthStr] = dateKey.split('-');
                const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
                displayDate = monthNames[parseInt(monthStr) - 1] || `Maand ${monthStr}`;
                sortKey = dateKey;
                break;
            }
            
            return {
              date: displayDate,
              dateKey: sortKey,
              visitors: data.visitors.size,
              pageViews: data.pageViews
            };
          })
          .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      }

      const topPages = Object.entries(pageViewsMap)
        .map(([path, data]) => ({
          path,
          views: data.views,
          avgDuration: data.durations.length > 0
            ? Math.round(data.durations.reduce((acc: number, val: number) => acc + val, 0) / data.durations.length)
            : 0
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Get recent visitors (based on limit)
      const recentVisitors = filteredVisits
        ?.slice(0, recentVisitorsLimit)
        .map((visit: any) => ({
          id: visit.id,
          ip_address: visit.ip_address,
          country: visit.country,
          city: visit.city,
          page_path: visit.page_path,
          visited_at: visit.visited_at,
          browser: visit.browser || 'Unknown',
          device_type: visit.device_type || 'Unknown'
        })) || [];

      setAnalyticsData({
        totalVisitors: filteredVisits?.length || 0,
        uniqueVisitors: uniqueVisitors.size,
        pageViews: filteredVisits?.length || 0,
        avgSessionDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
        topPages,
        referrers: Object.entries(referrerMap)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        devices: Object.entries(deviceMap)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        browsers: Object.entries(browserMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        timeSeriesData,
        countries: Object.entries(countryMap)
          .map(([country, data]) => ({ country, country_code: data.code, count: data.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20),
        cities: Object.entries(cityMap)
          .map(([city, data]) => ({ city, country: data.country, count: data.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15),
        languages: Object.entries(languageMap)
          .map(([language, count]) => ({ language, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        hourlyData: Object.entries(hourlyMap)
          .map(([hour, data]) => ({ hour: parseInt(hour), visitors: data.visitors.size, pageViews: data.pageViews }))
          .sort((a, b) => a.hour - b.hour),
        recentVisitors
      });
    } catch (error) {
      console.error('Error processing analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const analyzeSEO = async () => {
    setIsAnalyzing(true);
    setSeoIssues([]);
    setSeoScore(null);
    setAiRecommendations([]);

    try {
      // Get current website URL
      const websiteUrl = window.location.origin;
      
      // Analyze current page and other pages
      const pagesToAnalyze = [
        '/',
        '/bitcoin-history',
        '/portfolio',
        '/user-dashboard',
        '/admin'
      ];

      const issues: SEOIssue[] = [];
      let totalScore = 100;

      // Analyze each page
      for (const page of pagesToAnalyze) {
        try {
          const response = await fetch(`${websiteUrl}${page}`);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Check title tag
          const title = doc.querySelector('title')?.textContent || '';
          if (!title || title.length < 30 || title.length > 60) {
            issues.push({
              type: 'warning',
              title: 'Title tag optimalisatie',
              description: `Pagina "${page}" heeft een title tag die ${title.length} karakters lang is.`,
              suggestion: title.length < 30 
                ? 'Voeg meer relevante keywords toe aan de title tag (30-60 karakters).'
                : 'Verkort de title tag tot maximaal 60 karakters voor betere weergave in zoekresultaten.',
              page
            });
            totalScore -= 2;
          }

          // Check meta description
          const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
          if (!metaDesc || metaDesc.length < 120 || metaDesc.length > 160) {
            issues.push({
              type: 'warning',
              title: 'Meta description optimalisatie',
              description: `Pagina "${page}" heeft ${metaDesc ? 'een' : 'geen'} meta description (${metaDesc.length} karakters).`,
              suggestion: !metaDesc
                ? 'Voeg een meta description toe van 120-160 karakters met relevante keywords.'
                : metaDesc.length < 120
                ? 'Verleng de meta description tot minimaal 120 karakters.'
                : 'Verkort de meta description tot maximaal 160 karakters.',
              page
            });
            totalScore -= 2;
          }

          // Check H1 tag
          const h1 = doc.querySelector('h1');
          if (!h1) {
            issues.push({
              type: 'error',
              title: 'Ontbrekende H1 tag',
              description: `Pagina "${page}" heeft geen H1 tag.`,
              suggestion: 'Voeg een H1 tag toe met het belangrijkste keyword voor deze pagina.',
              page
            });
            totalScore -= 5;
          }

          // Check images without alt text
          const images = doc.querySelectorAll('img');
          let imagesWithoutAlt = 0;
          images.forEach(img => {
            if (!img.getAttribute('alt')) {
              imagesWithoutAlt++;
            }
          });
          if (imagesWithoutAlt > 0) {
            issues.push({
              type: 'warning',
              title: 'Afbeeldingen zonder alt-tekst',
              description: `Pagina "${page}" heeft ${imagesWithoutAlt} afbeelding(en) zonder alt-tekst.`,
              suggestion: 'Voeg beschrijvende alt-teksten toe aan alle afbeeldingen voor betere toegankelijkheid en SEO.',
              page
            });
            totalScore -= imagesWithoutAlt * 1;
          }

          // Check for internal links
          const links = doc.querySelectorAll('a[href]');
          const internalLinks = Array.from(links).filter(link => {
            const href = link.getAttribute('href') || '';
            return href.startsWith('/') || href.startsWith(websiteUrl);
          });
          if (internalLinks.length < 3) {
            issues.push({
              type: 'info',
              title: 'Weinig interne links',
              description: `Pagina "${page}" heeft ${internalLinks.length} interne link(s).`,
              suggestion: 'Voeg meer interne links toe naar relevante pagina\'s voor betere site structuur.',
              page
            });
            totalScore -= 1;
          }

        } catch (error) {
          console.error(`Error analyzing page ${page}:`, error);
        }
      }

      // AI-powered recommendations for crypto beginners in Dutch
      const cryptoRecommendations = [
        'Voeg een sectie toe: "Begin hier met Bitcoin" met duidelijke stappen voor beginners',
        'Creëer content over "Bitcoin voor beginners" met veelgestelde vragen in het Nederlands',
        'Voeg schema.org structured data toe voor FAQ-secties over Bitcoin',
        'Schrijf blogposts over "Hoe begin ik met crypto?" met praktische tips',
        'Maak een "Bitcoin Starter Guide" pagina met visuele uitleg',
        'Voeg testimonials toe van gebruikers die succesvol zijn begonnen met Bitcoin',
        'Creëer video content of tutorials voor visuele learners',
        'Optimaliseer voor long-tail keywords zoals "hoe begin ik met bitcoin nederland"',
        'Voeg een chatbot toe die beginners helpt met veelgestelde vragen',
        'Maak een "Bitcoin Calculator" tool voor beginners om te zien hoeveel ze kunnen investeren'
      ];

      setSeoIssues(issues);
      setSeoScore(Math.max(0, totalScore));
      setAiRecommendations(cryptoRecommendations);
    } catch (error) {
      console.error('Error analyzing SEO:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const drawChart = () => {
    const canvas = chartCanvasRef.current;
    if (!canvas || !analyticsData?.timeSeriesData || analyticsData.timeSeriesData.length === 0) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '400px';

    const width = rect.width;
    const height = 400;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const data = analyticsData.timeSeriesData;
    const maxVisitors = Math.max(...data.map(d => d.visitors), 1);
    const maxPageViews = Math.max(...data.map(d => d.pageViews), 1);
    const maxValue = Math.max(maxVisitors, maxPageViews);

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (height - padding.top - padding.bottom) * (i / gridLines);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const value = Math.round(maxValue * (1 - i / gridLines));
      ctx.fillText(value.toString(), padding.left - 10, y);
    }

    // Draw X-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // For day view, show all 24 hours (but skip some if too many)
    // For week view, show all 7 days
    // For other views, show max 12 labels
    let step = 1;
    if (timePeriod === 'day') {
      step = data.length <= 24 ? 1 : Math.max(1, Math.floor(data.length / 12));
    } else if (timePeriod === 'week') {
      step = 1; // Always show all 7 days
    } else {
      step = Math.max(1, Math.floor(data.length / 12));
    }
    
    data.forEach((point, index) => {
      if (index % step === 0 || index === data.length - 1) {
        const barSpacing = (width - padding.left - padding.right) / data.length;
        const x = padding.left + (barSpacing * index) + barSpacing / 2;
        let label = point.date;
        
        // For day view, show hour format (already formatted as "00:00")
        // For week view, labels already include day name and date
        
        ctx.save();
        ctx.translate(x, height - padding.bottom + 10);
        // Rotate if label is long (but not for hours which are short)
        if (label.length > 8 && timePeriod !== 'day') {
          ctx.rotate(-Math.PI / 4);
        }
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
    });

    // Draw vertical bars (from bottom to top)
    if (data.length > 0) {
      const barWidth = (width - padding.left - padding.right) / data.length * 0.6; // 60% of available space per bar
      const barSpacing = (width - padding.left - padding.right) / data.length;
      const chartBottom = height - padding.bottom;
      const chartHeight = height - padding.top - padding.bottom;

      // Store bar positions for hover detection
      const barPositions: Array<{ x: number; y: number; width: number; height: number; data: typeof data[0] }> = [];

      data.forEach((point, index) => {
        const x = padding.left + (barSpacing * index) + (barSpacing - barWidth) / 2;
        
        // Calculate bar heights
        const visitorsBarHeight = (point.visitors / maxValue) * chartHeight;
        const pageViewsBarHeight = (point.pageViews / maxValue) * chartHeight;
        
        // Store position for hover (use the combined bar area)
        barPositions.push({
          x: x,
          y: padding.top,
          width: barWidth,
          height: chartHeight,
          data: point
        });

        // Draw visitors bar (blue) - left side
        if (point.visitors > 0) {
          const visitorsX = x;
          const visitorsY = chartBottom - visitorsBarHeight;
          
          // Gradient for visitors bar
          const visitorsGradient = ctx.createLinearGradient(visitorsX, visitorsY, visitorsX, chartBottom);
          visitorsGradient.addColorStop(0, '#60a5fa'); // Lighter blue at top
          visitorsGradient.addColorStop(1, '#3b82f6'); // Darker blue at bottom
          
          ctx.fillStyle = visitorsGradient;
          ctx.fillRect(visitorsX, visitorsY, barWidth * 0.45, visitorsBarHeight);
          
          // Add subtle border
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1;
          ctx.strokeRect(visitorsX, visitorsY, barWidth * 0.45, visitorsBarHeight);
          
          // Add value label on top of bar
          if (visitorsBarHeight > 15) {
            ctx.fillStyle = '#1e40af';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
              point.visitors.toString(),
              visitorsX + (barWidth * 0.45) / 2,
              visitorsY - 3
            );
          }
        }

        // Draw page views bar (orange) - right side
        if (point.pageViews > 0) {
          const pageViewsX = x + barWidth * 0.55;
          const pageViewsY = chartBottom - pageViewsBarHeight;
          
          // Gradient for page views bar
          const pageViewsGradient = ctx.createLinearGradient(pageViewsX, pageViewsY, pageViewsX, chartBottom);
          pageViewsGradient.addColorStop(0, '#fb923c'); // Lighter orange at top
          pageViewsGradient.addColorStop(1, '#f97316'); // Darker orange at bottom
          
          ctx.fillStyle = pageViewsGradient;
          ctx.fillRect(pageViewsX, pageViewsY, barWidth * 0.45, pageViewsBarHeight);
          
          // Add subtle border
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 1;
          ctx.strokeRect(pageViewsX, pageViewsY, barWidth * 0.45, pageViewsBarHeight);
          
          // Add value label on top of bar
          if (pageViewsBarHeight > 15) {
            ctx.fillStyle = '#c2410c';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
              point.pageViews.toString(),
              pageViewsX + (barWidth * 0.45) / 2,
              pageViewsY - 3
            );
          }
        }
      });
      
      // Store bar positions in canvas data attribute for hover detection
      (canvas as any).barPositions = barPositions;
    }

    // Draw legend
    const legendY = 20;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(padding.left, legendY, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Bezoekers', padding.left + 25, legendY + 2);

    ctx.fillStyle = '#f97316';
    ctx.fillRect(padding.left + 100, legendY, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.fillText('Pagina Weergaven', padding.left + 125, legendY + 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">SEO & Analytics</h2>
          <p className="text-gray-600 mt-2">
            Analyseer en optimaliseer je website voor betere zoekresultaten en bekijk bezoekersstatistieken
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab('seo')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeSubTab === 'seo'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              SEO Analyse
            </div>
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeSubTab === 'analytics'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Bezoekers Analytics
            </div>
          </button>
        </div>
      </div>

      {/* SEO Tab */}
      {activeSubTab === 'seo' && (
        <div className="space-y-6">
          {/* SEO Score Card */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">SEO Score</h3>
                <p className="text-gray-600">
                  {seoScore !== null 
                    ? `Je website heeft een SEO score van ${seoScore}/100`
                    : 'Klik op "Analyseer Website" om je SEO score te berekenen'
                  }
                </p>
              </div>
              {seoScore !== null && (
                <div className="text-6xl font-bold text-orange-600">
                  {seoScore}
                </div>
              )}
            </div>
            <button
              onClick={analyzeSEO}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyseren...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyseer Website
                </>
              )}
            </button>
          </div>

          {/* AI Recommendations for Crypto Beginners */}
          {aiRecommendations.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  AI Aanbevelingen: Website aanraden voor Crypto Beginners
                </h3>
              </div>
              <p className="text-gray-700 mb-4">
                Deze aanbevelingen helpen je website te positioneren als de beste startplek voor beginners die willen beginnen met crypto in het Nederlands:
              </p>
              <div className="space-y-3">
                {aiRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-800">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Issues */}
          {seoIssues.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Gevonden SEO Issues ({seoIssues.length})
              </h3>
              <div className="space-y-4">
                {seoIssues.map((issue, index) => (
                  <div
                    key={index}
                    className={`border-l-4 rounded-lg p-4 ${
                      issue.type === 'error'
                        ? 'border-red-500 bg-red-50'
                        : issue.type === 'warning'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {issue.type === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : issue.type === 'warning' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
                        <p className="text-gray-700 mb-2">{issue.description}</p>
                        {issue.suggestion && (
                          <p className="text-sm text-gray-600 italic">
                            💡 {issue.suggestion}
                          </p>
                        )}
                        {issue.page && (
                          <p className="text-xs text-gray-500 mt-2">Pagina: {issue.page}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick SEO Tips */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Snelle SEO Tips</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Content Optimalisatie</h4>
                  <p className="text-sm text-gray-600">
                    Zorg voor unieke, waardevolle content met relevante keywords voor crypto beginners
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <ImageIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Afbeeldingen</h4>
                  <p className="text-sm text-gray-600">
                    Voeg alt-teksten toe aan alle afbeeldingen voor betere toegankelijkheid
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <LinkIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Interne Links</h4>
                  <p className="text-sm text-gray-600">
                    Link naar relevante pagina's binnen je website voor betere navigatie
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Snelheid</h4>
                  <p className="text-sm text-gray-600">
                    Optimaliseer laadtijden voor betere gebruikerservaring en ranking
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Smartphone className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Mobielvriendelijk</h4>
                  <p className="text-sm text-gray-600">
                    Zorg dat je website perfect werkt op mobiele apparaten
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Globe className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Structured Data</h4>
                  <p className="text-sm text-gray-600">
                    Voeg schema.org markup toe voor betere weergave in zoekresultaten
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {isLoadingAnalytics ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analytics data laden...</p>
            </div>
          ) : analyticsData ? (
            <>
              {/* Time Period Selector and Filters */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Tijdsperiode</h3>
                    <div className="flex gap-2 flex-wrap">
                      {(['day', 'week', 'month', 'year'] as TimePeriod[]).map((period) => (
                        <button
                          key={period}
                          onClick={() => setTimePeriod(period)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            timePeriod === period
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {period === 'day' && 'Per Dag'}
                          {period === 'week' && 'Per Week'}
                          {period === 'month' && 'Per Maand'}
                          {period === 'year' && 'Per Jaar'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* City and IP Filters */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter op Stad</label>
                      <select
                        value={selectedCity || ''}
                        onChange={(e) => setSelectedCity(e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Alle steden</option>
                        {analyticsData?.cities.map((city, index) => (
                          <option key={index} value={`${city.city}, ${city.country}`}>
                            {city.city}, {city.country} ({city.count})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter op IP Adres</label>
                      <select
                        value={selectedIp || ''}
                        onChange={(e) => setSelectedIp(e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Alle IP adressen</option>
                        {analyticsData?.recentVisitors
                          .filter((v, index, self) => 
                            v.ip_address && 
                            index === self.findIndex(t => t.ip_address === v.ip_address)
                          )
                          .map((visitor, index) => (
                            <option key={index} value={visitor.ip_address}>
                              {visitor.ip_address}
                            </option>
                          ))}
                      </select>
                    </div>
                    {(selectedCity || selectedIp) && (
                      <button
                        onClick={() => {
                          setSelectedCity(null);
                          setSelectedIp(null);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                      >
                        Filters wissen
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Visitor Chart */}
              {analyticsData.timeSeriesData && analyticsData.timeSeriesData.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Bezoekers Overzicht</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-blue-500"></div>
                        <span>Bezoekers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-orange-500"></div>
                        <span>Pagina Weergaven</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <canvas
                      ref={chartCanvasRef}
                      className="w-full cursor-pointer"
                      style={{ maxHeight: '400px' }}
                      onMouseMove={handleChartMouseMove}
                      onMouseLeave={handleChartMouseLeave}
                    />
                    {/* Tooltip */}
                    {hoveredBar && (
                      <div
                        className="absolute bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3 z-50 pointer-events-none"
                        style={{
                          left: `${hoveredBar.x + 10}px`,
                          top: `${hoveredBar.y - 10}px`,
                          transform: 'translateY(-100%)'
                        }}
                      >
                        <div className="font-semibold mb-2 border-b border-gray-700 pb-1">
                          {timePeriod === 'day' && `Uur: ${hoveredBar.data.date}`}
                          {timePeriod === 'week' && `Dag: ${hoveredBar.data.date}`}
                          {timePeriod === 'month' && `Week: ${hoveredBar.data.date}`}
                          {timePeriod === 'year' && `Maand: ${hoveredBar.data.date}`}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Bezoekers: <strong>{hoveredBar.data.visitors}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded"></div>
                            <span>Pagina Weergaven: <strong>{hoveredBar.data.pageViews}</strong></span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-4 transform translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Totaal Bezoekers</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.totalVisitors}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Eye className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unieke Bezoekers</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.uniqueVisitors}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pagina Weergaven</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.pageViews}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gem. Sessie Duur</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.floor(analyticsData.avgSessionDuration / 60)}m {analyticsData.avgSessionDuration % 60}s
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Meest Bezochte Pagina's</h3>
                {analyticsData.topPages.length > 0 ? (
                  <div className="space-y-3">
                    {analyticsData.topPages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{page.path || '/'}</p>
                            <p className="text-sm text-gray-600">
                              {page.avgDuration > 0 
                                ? `Gem. ${Math.floor(page.avgDuration / 60)}m ${page.avgDuration % 60}s`
                                : 'Geen duur data'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{page.views}</p>
                          <p className="text-xs text-gray-500">weergaven</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nog geen pagina data beschikbaar</p>
                )}
              </div>

              {/* Referrers & Devices */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Verkeersbronnen</h3>
                  {analyticsData.referrers.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsData.referrers.map((ref, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-900 truncate">{ref.source}</p>
                          <span className="text-orange-600 font-bold">{ref.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Geen referrer data</p>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Apparaten</h3>
                  {analyticsData.devices.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsData.devices.map((device, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {device.type === 'Mobile' ? (
                              <Smartphone className="w-4 h-4 text-gray-600" />
                            ) : device.type === 'Tablet' ? (
                              <Monitor className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Monitor className="w-4 h-4 text-gray-600" />
                            )}
                            <p className="text-gray-900">{device.type}</p>
                          </div>
                          <span className="text-orange-600 font-bold">{device.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Geen device data</p>
                  )}
                </div>
              </div>

              {/* Countries & Cities */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe2 className="w-6 h-6 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-900">Landen</h3>
                  </div>
                  {analyticsData.countries.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsData.countries.map((country, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <div>
                              <p className="text-gray-900 font-medium">{country.country}</p>
                              {country.country_code && (
                                <p className="text-xs text-gray-500">{country.country_code}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-orange-600 font-bold">{country.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Geen land data beschikbaar</p>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Map className="w-6 h-6 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-900">Steden</h3>
                  </div>
                  {analyticsData.cities.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {analyticsData.cities.map((city, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedCity === `${city.city}, ${city.country}`
                              ? 'bg-orange-100 border-2 border-orange-500'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            if (selectedCity === `${city.city}, ${city.country}`) {
                              setSelectedCity(null);
                            } else {
                              setSelectedCity(`${city.city}, ${city.country}`);
                            }
                          }}
                        >
                          <div>
                            <p className="text-gray-900 font-medium">{city.city}</p>
                            <p className="text-xs text-gray-500">{city.country}</p>
                          </div>
                          <span className="text-orange-600 font-bold">{city.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Geen stad data beschikbaar</p>
                  )}
                </div>
              </div>

              {/* Languages & Hourly Activity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Languages className="w-6 h-6 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-900">Talen</h3>
                  </div>
                  {analyticsData.languages.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsData.languages.map((lang, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-900 font-medium">{lang.language.toUpperCase()}</p>
                          <span className="text-orange-600 font-bold">{lang.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Geen taal data</p>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-900">Activiteit per Uur</h3>
                  </div>
                  {analyticsData.hourlyData.length > 0 ? (
                    <div className="space-y-2">
                      {analyticsData.hourlyData.map((hour, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-16 text-sm text-gray-600 font-medium">
                            {String(hour.hour).padStart(2, '0')}:00
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-orange-500 h-full rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${(hour.visitors / Math.max(...analyticsData.hourlyData.map(h => h.visitors))) * 100}%` }}
                            >
                              {hour.visitors > 0 && (
                                <span className="text-xs text-white font-medium">{hour.visitors}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Geen uur data</p>
                  )}
                </div>
              </div>

              {/* Recent Visitors with IP */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-900">Recente Bezoekers</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Toon:</span>
                    <select
                      value={recentVisitorsLimit}
                      onChange={(e) => setRecentVisitorsLimit(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                {analyticsData.recentVisitors.length > 0 ? (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tijd</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IP Adres</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Locatie</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pagina</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Browser</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Apparaat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.recentVisitors.map((visitor, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {new Date(visitor.visited_at).toLocaleString('nl-NL', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 font-mono">
                              {visitor.ip_address || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {visitor.city && visitor.country 
                                ? `${visitor.city}, ${visitor.country}`
                                : visitor.country || 'Onbekend'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-xs">
                              {visitor.page_path}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{visitor.browser}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{visitor.device_type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Geen recente bezoekers</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen Analytics Data</h3>
              <p className="text-gray-600 mb-4">
                Analytics data wordt verzameld zodra bezoekers je website bezoeken
              </p>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-gray-900 mb-2">Debug informatie:</p>
                <ul className="text-xs text-gray-600 space-y-1 mb-4">
                  <li>• Open de browser console (F12) om tracking errors te zien</li>
                  <li>• Controleer of de visitor_analytics tabel bestaat in Supabase</li>
                  <li>• Controleer RLS policies voor de visitor_analytics tabel</li>
                  <li>• Bezoek een pagina om tracking te testen</li>
                </ul>
                <button
                  onClick={async () => {
                    try {
                      // Test insert directly
                      const { error } = await supabase.from('visitor_analytics').insert({
                        visitor_id: 'test-' + Date.now(),
                        session_id: 'test-session',
                        page_path: '/test',
                        referrer: 'Direct',
                        user_agent: navigator.userAgent,
                        browser: 'Test',
                        device_type: 'Desktop',
                        os: 'Test OS',
                        ip_address: '127.0.0.1',
                        country: 'Netherlands',
                        country_code: 'NL',
                        city: 'Amsterdam',
                        language: 'nl',
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                      });
                      
                      if (error) {
                        alert('Test insert failed: ' + error.message + '\n\nCheck console for details.');
                        console.error('Test insert error:', error);
                      } else {
                        alert('Test insert successful! Refresh the page to see the data.');
                        loadAnalytics();
                      }
                    } catch (err) {
                      alert('Test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
                      console.error('Test error:', err);
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  Test Tracking (Voeg test data toe)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

