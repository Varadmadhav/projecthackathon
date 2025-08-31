import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CarbonCreditDashboard = ({ data, onSellCredits }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carbon Credit Dashboard</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Prediction</Text>
        <Text style={styles.value}>{data.currentPrediction.toFixed(3)} tC/ha/year</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Annual CO2 Equivalent</Text>
        <Text style={styles.value}>{data.annualRate.toFixed(2)} tCO2e</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Carbon Credits</Text>
        <Text style={styles.value}>{data.userCredits.toFixed(2)} tCO2e</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => onSellCredits(1.0)}
          disabled={data.userCredits < 1.0}
        >
          <Text style={styles.buttonText}>Sell 1.0 Credit</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Generated Credits</Text>
        <Text style={styles.value}>{data.totalCredits.toFixed(2)} tCO2e</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sensor Data</Text>
        <View style={styles.sensorGrid}>
          {Object.entries(data.sensorData).map(([key, value]) => (
            <View key={key} style={styles.sensorItem}>
              <Text style={styles.sensorLabel}>{formatSensorName(key)}</Text>
              <Text style={styles.sensorValue}>{formatSensorValue(key, value)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Helper functions for formatting
const formatSensorName = (key) => {
  const names = {
    soil_moist: 'Soil Moisture',
    temp: 'Temperature',
    humidity: 'Humidity',
    light: 'Light',
    soil_temp: 'Soil Temp'
  };
  return names[key] || key;
};

const formatSensorValue = (key, value) => {
  const units = {
    soil_moist: '%',
    temp: '°C',
    humidity: '%',
    light: 'lux',
    soil_temp: '°C'
  };
  return `${value}${units[key] || ''}`;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorItem: {
    width: '48%',
    marginVertical: 8,
  },
  sensorLabel: {
    fontSize: 14,
    color: '#666',
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CarbonCreditDashboard;