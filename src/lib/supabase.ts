import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xpwdtjmtaqzrjyeazszz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwd2R0am10YXF6cmp5ZWF6c3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NjkzMDMsImV4cCI6MjA2MTA0NTMwM30.6hWvRv0li-0HTI1KcknfD3ZvGIvjJtcTtsqBQA8eIkc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function findSalesRepForLead(
  leadData: {
    city?: string;
    leadSource?: string;
    leadStatus?: string;
  }
) {
  try {
    let salesRepId = null;
    
    // First try to find a city-specific routing rule
    if (leadData.city) {
      const { data: cityRule } = await supabase
        .from('city_routing_rules')
        .select('sales_rep_id')
        .eq('is_active', true)
        .eq('city', leadData.city)
        .maybeSingle();
      
      if (cityRule?.sales_rep_id) {
        return {
          salesRepId: cityRule.sales_rep_id,
          routingMethod: 'city'
        };
      }
    }
    
    // If no city rule, use percentage-based routing
    const { data: rules } = await supabase
      .from('routing_rules')
      .select('id, sales_rep_id, percentage')
      .eq('is_active', true)
      .order('percentage', { ascending: false });
    
    if (rules && rules.length > 0) {
      // Generate a random number between 0 and 100
      const randomValue = Math.random() * 100;
      let cumulativePercentage = 0;
      
      for (const rule of rules) {
        cumulativePercentage += rule.percentage;
        if (randomValue <= cumulativePercentage) {
          return {
            salesRepId: rule.sales_rep_id,
            routingMethod: 'percentage',
            randomValue
          };
        }
      }
      
      // If we get here, use the last rule (should be rare if percentages sum to 100)
      return {
        salesRepId: rules[rules.length - 1].sales_rep_id,
        routingMethod: 'percentage-fallback',
        randomValue
      };
    }
    
    // If no routing rules found at all, return null
    return {
      salesRepId: null,
      routingMethod: 'none'
    };
  } catch (error) {
    console.error('Error finding sales rep:', error);
    return {
      salesRepId: null,
      routingMethod: 'error'
    };
  }
}

export async function logRouting(
  leadData: {
    email: string;
    city: string;
    leadSource: string;
    leadStatus: string;
  },
  routingResult: {
    salesRepId: string | null;
    routingMethod: string;
    randomValue?: number;
  }
) {
  try {
    await supabase.from('routing_logs').insert({
      lead_email: leadData.email,
      lead_city: leadData.city,
      lead_source: leadData.leadSource,
      lead_status: leadData.leadStatus,
      assigned_sales_rep_id: routingResult.salesRepId,
      routing_method: routingResult.routingMethod,
      routing_criteria: { leadData },
      random_value: routingResult.randomValue
    });
  } catch (error) {
    console.error('Error logging routing:', error);
  }
} 