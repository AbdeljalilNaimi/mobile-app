import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PlatformStats {
  // Users
  totalCitizens: number;
  totalProviders: number;
  totalAdmins: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  
  // Providers
  verifiedProviders: number;
  pendingProviders: number;
  rejectedProviders: number;
  
  // Engagement
  totalAppointments: number;
  appointmentsToday: number;
  totalReviews: number;
  averageRating: number;
  
  // Platform health
  totalPageViews: number;
  activeUsersToday: number;
}

export interface DailyStats {
  date: string;
  newUsers: number;
  newProviders: number;
  appointments: number;
  pageViews: number;
}

export interface ProviderTypeCount {
  type: string;
  count: number;
  color: string;
}

export interface VerificationStats {
  status: string;
  count: number;
  color: string;
}

const PROVIDER_TYPE_COLORS: Record<string, string> = {
  doctor: '#3B82F6',
  clinic: '#10B981',
  hospital: '#8B5CF6',
  pharmacy: '#F59E0B',
  laboratory: '#EF4444',
  dentist: '#06B6D4',
  specialist: '#EC4899',
  other: '#6B7280',
};

/**
 * Get platform-wide statistics
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    // Get providers
    const providersSnap = await getDocs(collection(db, 'providers'));
    const providers = providersSnap.docs.map(doc => doc.data());

    // Get citizens
    const citizensSnap = await getDocs(collection(db, 'citizens'));
    
    // Get admin profiles
    const adminsSnap = await getDocs(collection(db, 'admin_profiles'));

    // Get appointments
    const appointmentsSnap = await getDocs(collection(db, 'appointments'));
    const appointments = appointmentsSnap.docs.map(doc => doc.data());

    // Get reviews
    const reviewsSnap = await getDocs(collection(db, 'reviews'));
    const reviews = reviewsSnap.docs.map(doc => doc.data());

    // Calculate stats
    const verifiedProviders = providers.filter(p => 
      p.verified === true || p.verificationStatus === 'verified'
    ).length;

    const pendingProviders = providers.filter(p => 
      p.verificationStatus === 'pending'
    ).length;

    const rejectedProviders = providers.filter(p => 
      p.verificationStatus === 'rejected'
    ).length;

    const todayAppointments = appointments.filter(a => {
      const date = a.createdAt?.toDate?.() || new Date(a.createdAt);
      return date >= todayStart;
    }).length;

    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
      : 0;

    // Count new users today (simplified - checking createdAt)
    const newUsersToday = citizensSnap.docs.filter(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
      return createdAt >= todayStart;
    }).length;

    const newUsersThisWeek = citizensSnap.docs.filter(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
      return createdAt >= weekStart;
    }).length;

    return {
      totalCitizens: citizensSnap.size,
      totalProviders: providersSnap.size,
      totalAdmins: adminsSnap.size,
      newUsersToday,
      newUsersThisWeek,
      verifiedProviders,
      pendingProviders,
      rejectedProviders,
      totalAppointments: appointmentsSnap.size,
      appointmentsToday: todayAppointments,
      totalReviews: reviewsSnap.size,
      averageRating: Math.round(averageRating * 10) / 10,
      totalPageViews: 0, // Would need analytics integration
      activeUsersToday: newUsersToday, // Simplified
    };
  } catch (error) {
    console.error('Failed to get platform stats:', error);
    // Return default stats on error
    return {
      totalCitizens: 0,
      totalProviders: 0,
      totalAdmins: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
      verifiedProviders: 0,
      pendingProviders: 0,
      rejectedProviders: 0,
      totalAppointments: 0,
      appointmentsToday: 0,
      totalReviews: 0,
      averageRating: 0,
      totalPageViews: 0,
      activeUsersToday: 0,
    };
  }
}

/**
 * Get daily statistics for charts
 */
export async function getDailyStats(days: number = 30): Promise<DailyStats[]> {
  try {
    const stats: DailyStats[] = [];
    const now = new Date();

    // Generate last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // For demo purposes, generate realistic mock data
      // In production, you'd query actual data per day
      stats.push({
        date: dateStr,
        newUsers: Math.floor(Math.random() * 15) + 2,
        newProviders: Math.floor(Math.random() * 5) + 1,
        appointments: Math.floor(Math.random() * 25) + 5,
        pageViews: Math.floor(Math.random() * 500) + 100,
      });
    }

    return stats;
  } catch (error) {
    console.error('Failed to get daily stats:', error);
    return [];
  }
}

/**
 * Get providers grouped by type
 */
export async function getProvidersByType(): Promise<ProviderTypeCount[]> {
  try {
    const providersSnap = await getDocs(collection(db, 'providers'));
    const typeCount: Record<string, number> = {};

    providersSnap.docs.forEach(doc => {
      const type = doc.data().type || 'other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      color: PROVIDER_TYPE_COLORS[type] || PROVIDER_TYPE_COLORS.other,
    }));
  } catch (error) {
    console.error('Failed to get providers by type:', error);
    return [];
  }
}

/**
 * Get verification status distribution
 */
export async function getVerificationStats(): Promise<VerificationStats[]> {
  try {
    const providersSnap = await getDocs(collection(db, 'providers'));
    const statusCount: Record<string, number> = {
      verified: 0,
      pending: 0,
      rejected: 0,
      unverified: 0,
    };

    providersSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.verificationStatus) {
        statusCount[data.verificationStatus] = (statusCount[data.verificationStatus] || 0) + 1;
      } else if (data.verified) {
        statusCount.verified++;
      } else {
        statusCount.unverified++;
      }
    });

    const colors: Record<string, string> = {
      verified: '#10B981',
      pending: '#F59E0B',
      rejected: '#EF4444',
      unverified: '#6B7280',
    };

    return Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count,
        color: colors[status],
      }));
  } catch (error) {
    console.error('Failed to get verification stats:', error);
    return [];
  }
}

/**
 * Get registration trends
 */
export async function getRegistrationTrends(days: number = 30): Promise<{ date: string; registrations: number }[]> {
  try {
    const trends: { date: string; registrations: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Mock data for demo - in production, query actual registration dates
      trends.push({
        date: dateStr,
        registrations: Math.floor(Math.random() * 8) + 1,
      });
    }

    return trends;
  } catch (error) {
    console.error('Failed to get registration trends:', error);
    return [];
  }
}
