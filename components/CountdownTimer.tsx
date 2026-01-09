import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '../contexts/ThemeContext';
import i18n from '../utils/i18n';

interface CountdownTimerProps {
  onTimeUp?: () => void;
}

const DURATION_OPTIONS = [
  { label: '1 phút', value: 60 },
  { label: '2 phút', value: 120 },
  { label: '3 phút', value: 180 },
  { label: '5 phút', value: 300 },
  { label: '10 phút', value: 600 },
  { label: '15 phút', value: 900 },
  { label: '30 phút', value: 1800 },
];

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ onTimeUp }) => {
  const { theme } = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(300); // Default 5 minutes
  const [remaining, setRemaining] = useState(300);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const player = useAudioPlayer(require('../assets/timer-sound.mp3'));

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remaining]);

  const handleTimeUp = () => {
    setIsRunning(false);
    if (onTimeUp) {
      onTimeUp();
    }
    
    // Play sound
    try {
      player.play();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const toggleTimer = () => {
    if (!isEnabled) {
      setIsEnabled(true);
      setIsRunning(true);
    } else {
      setIsEnabled(false);
      setIsRunning(false);
      setRemaining(duration);
    }
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemaining(duration);
  };

  const selectDuration = (value: number) => {
    setDuration(value);
    setRemaining(value);
    setIsRunning(false);
    setShowDurationPicker(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isEnabled) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, { backgroundColor: theme.surface }]}
        onPress={toggleTimer}
      >
        <Ionicons name="timer-outline" size={20} color={theme.text} />
        <Text style={[styles.compactText, { color: theme.text }]}>
          {i18n.t('timer')}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <TouchableOpacity onPress={() => setShowDurationPicker(true)}>
        <Text style={[styles.timeText, { color: remaining <= 10 ? theme.error : theme.text }]}>
          {formatTime(remaining)}
        </Text>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={toggleRunning}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.warning }]}
          onPress={resetTimer}
        >
          <Ionicons name="refresh" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.error }]}
          onPress={toggleTimer}
        >
          <Ionicons name="close" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDurationPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDurationPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDurationPicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {i18n.t('duration')}
            </Text>
            <FlatList
              data={DURATION_OPTIONS}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.durationOption,
                    { borderBottomColor: theme.border },
                    item.value === duration && { backgroundColor: theme.primary + '20' }
                  ]}
                  onPress={() => selectDuration(item.value)}
                >
                  <Text style={[styles.durationText, { color: theme.text }]}>
                    {item.label}
                  </Text>
                  {item.value === duration && (
                    <Ionicons name="checkmark" size={24} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  compactText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    minWidth: 80,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  durationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  durationText: {
    fontSize: 16,
  },
});
