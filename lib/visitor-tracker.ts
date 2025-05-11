// lib/visitor-tracker.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const trackVisitor = async () => {
  try {
    // Don't track in development
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const supabase = createClientComponentClient();
    
    // Check for a tracking cookie to avoid duplicate tracking
    const trackingId = getOrCreateTrackingId();
    if (trackingId.isNew) {
      // Get IP address and user agent
      const ip_address = await getIpAddress();
      const user_agent = window.navigator.userAgent;
      
      // Insert visitor record
      await supabase.from('visitors').insert({
        ip_address,
        user_agent
      });
    }
  } catch (error) {
    // Silently fail if tracking doesn't work
    console.error('Visitor tracking error:', error);
  }
};

// Helper function to get or create a tracking ID cookie
const getOrCreateTrackingId = () => {
  // Check for existing cookie
  const cookies = document.cookie.split(';');
  const trackingCookie = cookies.find(cookie => cookie.trim().startsWith('visitor_tracking='));
  
  if (trackingCookie) {
    return { id: trackingCookie.split('=')[1], isNew: false };
  }
  
  // Generate a new tracking ID
  const trackingId = Math.random().toString(36).substring(2, 15);
  
  // Set cookie to expire in 24 hours
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + (24 * 60 * 60 * 1000));
  document.cookie = `visitor_tracking=${trackingId};expires=${expirationDate.toUTCString()};path=/`;
  
  return { id: trackingId, isNew: true };
};

// Helper function to get IP address
const getIpAddress = async (): Promise<string> => {
  try {
    // Use a simple service to get IP address
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};