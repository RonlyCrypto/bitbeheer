/**
 * Cycle Advisor Database Service
 * Handles Supabase integration for cycle advisor settings and logging
 */

import { supabase } from '../lib/supabase';
import { CycleAdvisorData } from './cycleAdvisorService';

export interface CycleAdvisorSettings {
  id?: string;
  user_id: string;
  enabled: boolean;
  mode: 'conservative' | 'balanced' | 'aggressive';
  show_roi_projections: boolean;
  show_cycle_comparison: boolean;
  notification_on_buy_signal: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CycleAdvisorLog {
  id?: string;
  user_id: string;
  cycle_number: number;
  current_phase: string;
  price_at_time: number;
  price_position_status: string;
  recommendation_level: string;
  investment_amount?: number;
  roi_projection?: any;
  created_at?: string;
}

class CycleAdvisorDatabaseService {
  /**
   * Get or create user's cycle advisor settings
   */
  async getOrCreateSettings(userId: string): Promise<CycleAdvisorSettings> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('cycle_advisor_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error fetching cycle advisor settings:', fetchError);
        // Return default settings
        return {
          user_id: userId,
          enabled: true,
          mode: 'balanced',
          show_roi_projections: true,
          show_cycle_comparison: true,
          notification_on_buy_signal: true
        };
      }

      if (existing) {
        return existing;
      }

      // Create default settings
      const defaultSettings: CycleAdvisorSettings = {
        user_id: userId,
        enabled: true,
        mode: 'balanced',
        show_roi_projections: true,
        show_cycle_comparison: true,
        notification_on_buy_signal: true
      };

      const { data: created, error: createError } = await supabase
        .from('cycle_advisor_settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating cycle advisor settings:', createError);
        return defaultSettings;
      }

      return created;
    } catch (error) {
      console.error('❌ Unexpected error in getOrCreateSettings:', error);
      return {
        user_id: userId,
        enabled: true,
        mode: 'balanced',
        show_roi_projections: true,
        show_cycle_comparison: true,
        notification_on_buy_signal: true
      };
    }
  }

  /**
   * Update user's cycle advisor settings
   */
  async updateSettings(userId: string, updates: Partial<CycleAdvisorSettings>): Promise<CycleAdvisorSettings | null> {
    try {
      const { data, error } = await supabase
        .from('cycle_advisor_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating cycle advisor settings:', error);
        return null;
      }

      console.log('✅ Cycle advisor settings updated');
      return data;
    } catch (error) {
      console.error('❌ Unexpected error in updateSettings:', error);
      return null;
    }
  }

  /**
   * Toggle cycle advisor on/off for a user
   */
  async toggleCycleAdvisor(userId: string, enabled: boolean): Promise<boolean> {
    const settings = await this.updateSettings(userId, { enabled });
    return settings?.enabled ?? false;
  }

  /**
   * Change cycle advisor mode
   */
  async changeCycleAdvisorMode(
    userId: string,
    mode: 'conservative' | 'balanced' | 'aggressive'
  ): Promise<CycleAdvisorSettings | null> {
    return this.updateSettings(userId, { mode });
  }

  /**
   * Log advisor recommendation for analytics
   */
  async logAdvisorRecommendation(
    userId: string,
    advisorData: CycleAdvisorData,
    investmentAmount?: number
  ): Promise<CycleAdvisorLog | null> {
    try {
      const logEntry: CycleAdvisorLog = {
        user_id: userId,
        cycle_number: advisorData.currentCycle.number,
        current_phase: advisorData.currentPhase,
        price_at_time: 0, // Will be calculated from chart data
        price_position_status: advisorData.pricePosition.status,
        recommendation_level: advisorData.recommendation.level,
        investment_amount: investmentAmount,
        roi_projection: advisorData.roiProjections
      };

      const { data, error } = await supabase
        .from('cycle_advisor_log')
        .insert([logEntry])
        .select()
        .single();

      if (error) {
        console.error('❌ Error logging advisor recommendation:', error);
        return null;
      }

      console.log('✅ Advisor recommendation logged');
      return data;
    } catch (error) {
      console.error('❌ Unexpected error in logAdvisorRecommendation:', error);
      return null;
    }
  }

  /**
   * Get user's advisor logs for analytics
   */
  async getAdvisorLogs(userId: string, limit: number = 100): Promise<CycleAdvisorLog[]> {
    try {
      const { data, error } = await supabase
        .from('cycle_advisor_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching advisor logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Unexpected error in getAdvisorLogs:', error);
      return [];
    }
  }

  /**
   * Get stats on how many users have cycle advisor enabled
   */
  async getAdvisorStats(): Promise<{
    totalEnabled: number;
    byMode: Record<string, number>;
  }> {
    try {
      const { data: enabledData, error: enabledError } = await supabase
        .from('cycle_advisor_settings')
        .select('mode')
        .eq('enabled', true);

      if (enabledError) {
        console.error('❌ Error fetching advisor stats:', enabledError);
        return { totalEnabled: 0, byMode: {} };
      }

      const byMode = { conservative: 0, balanced: 0, aggressive: 0 };
      (enabledData || []).forEach((row: any) => {
        if (row.mode in byMode) {
          byMode[row.mode]++;
        }
      });

      return {
        totalEnabled: enabledData?.length || 0,
        byMode
      };
    } catch (error) {
      console.error('❌ Unexpected error in getAdvisorStats:', error);
      return { totalEnabled: 0, byMode: {} };
    }
  }

  /**
   * Admin function: toggle cycle advisor for a specific user
   */
  async adminToggleCycleAdvisor(userId: string, enabled: boolean): Promise<boolean> {
    try {
      // Check if caller is admin (this should be enforced by RLS on the backend)
      const settings = await this.updateSettings(userId, { enabled });
      return settings?.enabled ?? false;
    } catch (error) {
      console.error('❌ Error in adminToggleCycleAdvisor:', error);
      return false;
    }
  }

  /**
   * Admin function: set cycle advisor mode for a specific user
   */
  async adminSetCycleAdvisorMode(
    userId: string,
    mode: 'conservative' | 'balanced' | 'aggressive'
  ): Promise<CycleAdvisorSettings | null> {
    try {
      return this.updateSettings(userId, { mode });
    } catch (error) {
      console.error('❌ Error in adminSetCycleAdvisorMode:', error);
      return null;
    }
  }
}

export const cycleAdvisorDatabaseService = new CycleAdvisorDatabaseService();

