import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import CarbonCreditDashboard from './components/CarbonCreditDashboard';
import integrationService from './services/integrationService';
import blockchainService from './services/blockchainService';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Mock user data for demo
  const mockUserId = '60d0fe4f5311236168a109ca';
  const mockToken = 'mocktoken123';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await integrationService.getDashboardData(mockUserId, mockToken);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load data. Please check if ML and backend servers are running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSellCredits = async (amount) => {
    try {
      setLoading(true);
      await blockchainService.sellCredits(mockUserId, amount, mockToken);
      Alert.alert('Success', `Successfully sold ${amount} carbon credits!`);
      // Reload dashboard data to reflect changes
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to sell credits:', err);
      Alert.alert('Error', 'Failed to sell credits. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>GramCred</Text>
        <Text style={styles.subheader}>Carbon Credit Management</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorNote}>
              Note: This is a demo showing the integration between the frontend, ML model, and blockchain.
              Mock data is displayed when servers are not available.
            </Text>
          </View>
        ) : (
          <CarbonCreditDashboard 
            data={dashboardData} 
            onSellCredits={handleSellCredits} 
          />
        )}
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            This app demonstrates the integration between:
          </Text>
          <Text style={styles.infoItem}>• React Native Frontend</Text>
          <Text style={styles.infoItem}>• ML Model (FastAPI)</Text>
          <Text style={styles.infoItem}>• Blockchain Backend (Express)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2e7d32',
  },
  subheader: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    padding: 24,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginVertical: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    marginBottom: 8,
  },
  errorNote: {
    fontSize: 14,
    color: '#555',
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
    color: '#555',
  },
});
