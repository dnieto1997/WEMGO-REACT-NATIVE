import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MonthlyCalendar = ({ events = [] }) => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayIndex = (month, year) => new Date(year, month, 1).getDay();

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const getEventsForDate = (year, month, day) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return Array.isArray(events)
      ? events.filter(
          (event) =>
            formatDate(event.initial_date) === dateStr &&
            event.status === '1'
        )
      : [];
  };

  const renderDay = (day, month, year, isCurrentMonth = true) => {
    const dayEvents = getEventsForDate(year, month, day);

    return (
      <View key={`${year}-${month}-${day}`} style={[styles.dayCell, !isCurrentMonth && { opacity: 0.3 }]}>
        <Text style={styles.dayNumber}>{day}</Text>
        {dayEvents.map((event, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate('EventDetails', { id: event.id })}
          >
            <Text numberOfLines={1} style={styles.eventText}>
             {event.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(month, year);
    const startDay = getFirstDayIndex(month, year);
    const calendar = [];

    // Días del mes anterior
    const prevMonth = month - 1 < 0 ? 11 : month - 1;
    const prevYear = month - 1 < 0 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(prevMonth, prevYear);
    for (let i = startDay - 1; i >= 0; i--) {
      calendar.push(renderDay(prevMonthDays - i, prevMonth, prevYear, false));
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push(renderDay(i, month, year, true));
    }

    // Días del siguiente mes
    const remaining = 7 - (calendar.length % 7);
    if (remaining < 7) {
      const nextMonth = (month + 1) % 12;
      const nextYear = month + 1 > 11 ? year + 1 : year;
      for (let i = 1; i <= remaining; i++) {
        calendar.push(renderDay(i, nextMonth, nextYear, false));
      }
    }

    return calendar;
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)}>
          <Text style={styles.arrow}>{'◀'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => handleMonthChange(1)}>
          <Text style={styles.arrow}>{'▶'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dayNames}>
        {dayNames.map((day, index) => (
          <Text key={index} style={styles.dayName}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {renderCalendar()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: 'white',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  dayNames: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  dayName: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontWeight: '600',
    color: 'white',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 90,
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
    padding: 4,
  },
  dayNumber: {
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#fff',
  },
  eventText: {
    fontSize: 10,
    color: '#B17DFF',
  },
});

export default MonthlyCalendar;
