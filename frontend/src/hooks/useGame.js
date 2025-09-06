import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../services/teamService';

export const useGame = () => {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(null);
  const [assignedLevels, setAssignedLevels] = useState([]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [progress, setProgress] = useState({
    completedLevels: 0,
    totalLevels: 8,
    progressPercentage: 0
  });
  const [gameStatus, setGameStatus] = useState('not_started');
  const [finalUnlocked, setFinalUnlocked] = useState(false);
  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshGameData = useCallback(async () => {
    if (!user?.token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch team progress
      const progressData = await teamService.getProgress();
      setCurrentLevel(progressData.currentLevel);
      setAssignedLevels(progressData.assignedLevels || []);
      setCompletedLevels(progressData.completedLevels || []);
      setFinalUnlocked(progressData.finalUnlocked || false);
      setFinalSubmitted(progressData.finalSubmitted || false);

      // Calculate progress
      const completed = progressData.completedLevels?.length || 0;
      const total = 8; // 8 regular levels
      const progressPercentage = Math.round((completed / total) * 100);
      
      setProgress({
        completedLevels: completed,
        totalLevels: total,
        progressPercentage
      });

      // Fetch submissions
      const submissionsData = await teamService.getSubmissions();
      setSubmissions(submissionsData || []);

      // Fetch game status
      try {
        const gameState = await teamService.getGameStatus();
        setGameStatus(gameState.status || 'not_started');
      } catch (err) {
        console.warn('Could not fetch game status:', err);
        setGameStatus('not_started');
      }

    } catch (err) {
      console.error('Error refreshing game data:', err);
      setError(err.message || 'Failed to load game data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    refreshGameData();
  }, [refreshGameData]);

  return {
    currentLevel,
    assignedLevels,
    completedLevels,
    progress,
    gameStatus,
    finalUnlocked,
    finalSubmitted,
    submissions,
    isLoading,
    error,
    refreshGameData
  };
};
