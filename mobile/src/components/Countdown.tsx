/**
 * Composant Countdown - Compte à rebours
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CountdownProps {
  targetDate: string;
  labels?: {
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
  };
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  labels = {
    days: 'jours',
    hours: 'heures',
    minutes: 'minutes',
    seconds: 'secondes',
  },
}) => {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <View style={styles.timeBlock}>
      <View
        style={[
          styles.valueContainer,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Text style={[styles.value, { color: theme.colors.textLight }]}>
          {value.toString().padStart(2, '0')}
        </Text>
      </View>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TimeBlock value={timeLeft.days} label={labels.days || 'jours'} />
      <Text style={[styles.separator, { color: theme.colors.primary }]}>:</Text>
      <TimeBlock value={timeLeft.hours} label={labels.hours || 'heures'} />
      <Text style={[styles.separator, { color: theme.colors.primary }]}>:</Text>
      <TimeBlock value={timeLeft.minutes} label={labels.minutes || 'minutes'} />
      <Text style={[styles.separator, { color: theme.colors.primary }]}>:</Text>
      <TimeBlock value={timeLeft.seconds} label={labels.seconds || 'secondes'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBlock: {
    alignItems: 'center',
  },
  valueContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
    marginBottom: 20,
  },
});

export default Countdown;
