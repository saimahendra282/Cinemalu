// Utility for merging Tailwind classes
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format runtime (minutes to hours and minutes)
export function formatRuntime(minutes: number): string {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

// Format date
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear().toString();
}

// Format vote average
export function formatVoteAverage(vote: number): string {
  if (!vote) return 'N/A';
  return vote.toFixed(1);
}

// Get TMDB image URL
export function getTMDBImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path) return '/placeholder-poster.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Local storage keys
export const STORAGE_KEYS = {
  WATCH_PROGRESS: 'streamcinema_watch_progress',
  CONTINUE_WATCHING: 'streamcinema_continue_watching',
} as const;

// Save watch progress to localStorage
export function saveWatchProgress(
  contentId: string,
  contentType: 'movie' | 'tv',
  progress: number,
  season?: number,
  episode?: number
) {
  try {
    const progressData = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS) || '{}');
    const key = season && episode ? `${contentId}-s${season}e${episode}` : contentId;
    
    progressData[key] = {
      contentId,
      contentType,
      progress,
      season,
      episode,
      lastWatched: Date.now(),
    };
    
    localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(progressData));
    
    // Also update continue watching list
    const continueWatching = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTINUE_WATCHING) || '[]');
    const existingIndex = continueWatching.findIndex((item: any) => 
      item.contentId === contentId && item.season === season && item.episode === episode
    );
    
    const watchItem = {
      contentId,
      contentType,
      progress,
      season,
      episode,
      lastWatched: Date.now(),
    };
    
    if (existingIndex >= 0) {
      continueWatching[existingIndex] = watchItem;
    } else {
      continueWatching.unshift(watchItem);
    }
    
    // Keep only last 20 items
    const trimmed = continueWatching.slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.CONTINUE_WATCHING, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving watch progress:', error);
  }
}

// Get watch progress from localStorage
export function getWatchProgress(
  contentId: string,
  season?: number,
  episode?: number
): number {
  try {
    const progressData = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS) || '{}');
    const key = season && episode ? `${contentId}-s${season}e${episode}` : contentId;
    return progressData[key]?.progress || 0;
  } catch {
    return 0;
  }
}

// Get continue watching list
export function getContinueWatchingList(): any[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTINUE_WATCHING) || '[]');
  } catch {
    return [];
  }
}