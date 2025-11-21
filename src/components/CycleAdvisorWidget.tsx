import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronRight,
  Loader2,
  DollarSign,
  Target
} from 'lucide-react';
import { cycleAdvisorService, CycleAdvisorData } from '../services/cycleAdvisorService';
import { cycleAdvisorDatabaseService, CycleAdvisorSettings } from '../services/cycleAdvisorDatabaseService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface CycleAdvisorWidgetProps {
  currentPrice: number;
  investmentAmount?: number;
  onClose?: () => void;
}

export default function CycleAdvisorWidget({
  currentPrice,
  investmentAmount = 500,
  onClose
}: CycleAdvisorWidgetProps) {
  const { user } = useSupabaseAuth();
  const [advisorData, setAdvisorData] = useState<CycleAdvisorData | null>(null);
  const [settings, setSettings] = useState<CycleAdvisorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<'recommendation' | 'projections' | 'comparison' | null>(null);

  useEffect(() => {
    // Initialize ATH data once on mount
    cycleAdvisorService.initializeATHData();
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPrice, investmentAmount, user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;

      // Load user settings
      const userSettings = await cycleAdvisorDatabaseService.getOrCreateSettings(user.id);
      setSettings(userSettings);

      // If disabled, don't load advisor data
      if (!userSettings.enabled) {
        setAdvisorData(null);
        setLoading(false);
        return;
      }

      // Load advisor data with user's mode
      const data = await cycleAdvisorService.getAdvisorData(
        currentPrice,
        investmentAmount,
        userSettings.mode,
        new Date()
      );
      setAdvisorData(data);

      // Log the recommendation for analytics
      await cycleAdvisorDatabaseService.logAdvisorRecommendation(user.id, data, investmentAmount);
    } catch (error) {
      console.error('❌ Error loading cycle advisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!advisorData || !settings || !settings.enabled) {
    return null;
  }

  const getRecommendationColor = (level: string) => {
    switch (level) {
      case 'strong_buy': return 'from-green-500 to-emerald-600';
      case 'buy': return 'from-green-400 to-emerald-500';
      case 'wait': return 'from-yellow-400 to-amber-500';
      case 'hold': return 'from-blue-400 to-indigo-500';
      case 'caution': return 'from-orange-400 to-red-500';
      case 'risky': return 'from-red-500 to-red-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRecommendationIcon = (level: string) => {
    switch (level) {
      case 'strong_buy':
      case 'buy':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'wait':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'hold':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'caution':
      case 'risky':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Info className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRecommendationLabel = (level: string) => {
    switch (level) {
      case 'strong_buy': return '🟢 STERKE KOOPSIGNAAL';
      case 'buy': return '🟢 KOOPSIGNAAL';
      case 'wait': return '🟡 WACHTEN';
      case 'hold': return '🔵 HOLD';
      case 'caution': return '🟠 VOORZICHTIG';
      case 'risky': return '🔴 RISKANT';
      default: return 'ONBEKEND';
    }
  };

  const currentATH = advisorData.currentCycle.previousATH || 0;
  const percentVsATH = advisorData.pricePosition.percentageVsPrevATH;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className={`bg-gradient-to-br ${getRecommendationColor(advisorData.recommendation.level)} rounded-xl shadow-lg p-6 text-white`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getRecommendationIcon(advisorData.recommendation.level)}
            <div>
              <h3 className="text-xs font-semibold opacity-90">Cycle {advisorData.currentCycle.number}</h3>
              <p className="text-lg font-bold">{getRecommendationLabel(advisorData.recommendation.level)}</p>
            </div>
          </div>
          <Zap className="w-8 h-8 opacity-40" />
        </div>

        <p className="text-sm opacity-90 mb-4">{advisorData.recommendation.description}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <p className="text-xs opacity-75">Prijs vs ATH</p>
            <p className="text-lg font-bold">
              {percentVsATH > 0 ? '+' : ''}{percentVsATH.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <p className="text-xs opacity-75">Mode</p>
            <p className="text-lg font-bold capitalize">{settings.mode}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <p className="text-xs opacity-75">Phase</p>
            <p className="text-lg font-bold capitalize">{advisorData.currentPhase}</p>
          </div>
        </div>
      </div>

      {/* Recommendation Details */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'recommendation' ? null : 'recommendation')}
          className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Waarom Deze Aanbeveling?</p>
              <p className="text-sm text-gray-600">{advisorData.recommendation.reasoning}</p>
            </div>
          </div>
          <ChevronRight
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expandedSection === 'recommendation' ? 'rotate-90' : ''
            }`}
          />
        </button>

        {expandedSection === 'recommendation' && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk Level</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  advisorData.recommendation.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                  advisorData.recommendation.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  advisorData.recommendation.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {advisorData.recommendation.riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Price</span>
                <span className="font-semibold">${currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Previous ATH</span>
                <span className="font-semibold">${currentATH.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ROI Projections */}
      {settings.show_roi_projections && advisorData.roiProjections.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'projections' ? null : 'projections')}
            className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">ROI Scenario's (€{investmentAmount})</p>
                <p className="text-sm text-gray-600">Potentiële winst in verschillende scenario's</p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSection === 'projections' ? 'rotate-90' : ''
              }`}
            />
          </button>

          {expandedSection === 'projections' && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
              {advisorData.roiProjections.map((projection, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900">{projection.scenario}</p>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-semibold">
                      {projection.likelihood}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">Target</p>
                      <p className="font-semibold">${projection.targetPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Waarde</p>
                      <p className="font-semibold">${projection.projectedValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">ROI</p>
                      <p className={`font-semibold ${projection.projectedROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {projection.projectedROI >= 0 ? '+' : ''}{projection.projectedROIPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cycle Comparison */}
      {settings.show_cycle_comparison && advisorData.cycleComparison.warnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'comparison' ? null : 'comparison')}
            className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Info className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Cycle Analyse</p>
                <p className="text-sm text-gray-600">Vergelijking met vorige cycles</p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSection === 'comparison' ? 'rotate-90' : ''
              }`}
            />
          </button>

          {expandedSection === 'comparison' && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
              {advisorData.cycleComparison.warnings.map((warning, idx) => (
                <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-900">{warning}</p>
                </div>
              ))}

              {advisorData.cycleComparison.similarities.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Overeenkomsten</p>
                  <ul className="space-y-1">
                    {advisorData.cycleComparison.similarities.map((sim, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {sim}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Education Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>⚠️ Disclaimer:</strong> Dit is geen financieel advies. Gebaseerd op historische patterns. 
          {advisorData.pricePosition.status === 'above_ath' && 
            ' Boven vorige ATH = geen historische data beschikbaar.'}
        </p>
      </div>
    </div>
  );
}

