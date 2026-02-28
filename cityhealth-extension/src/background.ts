import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hozjbchgaucbfqumrhhs.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvempiY2hnYXVjYmZxdW1yaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjM4OTAsImV4cCI6MjA4NzgzOTg5MH0.Sf-TEIxtDfz_liFlPfiP1robvSGpJTK24mcqAGHypwI';

const APP_URL = 'https://id-preview--8d2e14ae-9780-495c-92ff-a09ea8668d86.lovable.app';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userBloodGroup: string | null = null;

// Read blood group from storage
function loadBloodGroup() {
  chrome.storage.local.get(['bloodGroup'], (result) => {
    userBloodGroup = result.bloodGroup || null;
    console.log('[CityHealth BG] Blood group loaded:', userBloodGroup);
  });
}

// Listen for storage changes (when popup syncs blood group)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.bloodGroup) {
    userBloodGroup = changes.bloodGroup.newValue || null;
    console.log('[CityHealth BG] Blood group updated:', userBloodGroup);
  }
});

// Subscribe to blood emergencies via Supabase Realtime
function subscribeToEmergencies() {
  const channel = supabase
    .channel('ext-blood-emergencies')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'blood_emergencies',
        filter: 'status=eq.active',
      },
      (payload) => {
        const emergency = payload.new as any;
        console.log('[CityHealth BG] New emergency:', emergency);

        if (!userBloodGroup) return;

        // Check if user's blood group matches
        if (emergency.blood_type_needed === userBloodGroup) {
          chrome.notifications.create(`blood-emergency-${emergency.id}`, {
            type: 'basic',
            iconUrl: 'icons/icon-128.png',
            title: `🚨 Urgence Sang ${emergency.blood_type_needed}`,
            message: `Urgence Sang ${emergency.blood_type_needed} : Besoin vital détecté. Cliquez pour aider.`,
            priority: 2,
            requireInteraction: true,
          });
        }
      }
    )
    .subscribe((status) => {
      console.log('[CityHealth BG] Realtime subscription status:', status);
    });

  return channel;
}

// Handle notification click
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('blood-emergency-')) {
    chrome.tabs.create({ url: `${APP_URL}/don-de-sang` });
    chrome.notifications.clear(notificationId);
  }
});

// Initialize on install / startup
chrome.runtime.onInstalled.addListener(() => {
  console.log('[CityHealth BG] Extension installed');
  loadBloodGroup();
  subscribeToEmergencies();
});

chrome.runtime.onStartup.addListener(() => {
  loadBloodGroup();
  subscribeToEmergencies();
});

// Also run immediately (for when service worker wakes)
loadBloodGroup();
subscribeToEmergencies();
