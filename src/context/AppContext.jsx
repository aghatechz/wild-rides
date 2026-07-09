import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const DEFAULT_AWS_CONFIG = {
  region: localStorage.getItem('aws_region') || import.meta.env.VITE_AWS_REGION || 'us-east-1',
  userPoolId: localStorage.getItem('aws_user_pool_id') || import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  clientId: localStorage.getItem('aws_client_id') || import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  apiGatewayUrl: localStorage.getItem('aws_api_gateway_url') || import.meta.env.VITE_API_GATEWAY_URL || ''
};

export const AppProvider = ({ children }) => {
  const [isMockMode, setIsMockMode] = useState(
    !(import.meta.env.VITE_COGNITO_CLIENT_ID && import.meta.env.VITE_API_GATEWAY_URL)
  );
  
  const [awsConfig, setAwsConfigState] = useState(DEFAULT_AWS_CONFIG);
  const [user, setUser] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [consoleLogs, setConsoleLogs] = useState([]);

  // Load user and ride history from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('current_user');
      }
    }

    const savedRides = localStorage.getItem('ride_history');
    if (savedRides) {
      try {
        setRideHistory(JSON.parse(savedRides));
      } catch (e) {
        setRideHistory([]);
      }
    }

    addLog('System', 'Application initialized. Ready in ' + (isMockMode ? 'MOCK MODE' : 'AWS LIVE MODE'));
  }, []);

  const addLog = (service, message, payload = null) => {
    const newLog = {
      id: Date.now() + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      service,
      message,
      payload: payload ? JSON.stringify(payload, null, 2) : null
    };
    setConsoleLogs((prev) => [newLog, ...prev].slice(0, 100));
  };

  const clearLogs = () => setConsoleLogs([]);

  const updateAwsConfig = (newConfig) => {
    setAwsConfigState(newConfig);
    localStorage.setItem('aws_region', newConfig.region);
    localStorage.setItem('aws_user_pool_id', newConfig.userPoolId);
    localStorage.setItem('aws_client_id', newConfig.clientId);
    localStorage.setItem('aws_api_gateway_url', newConfig.apiGatewayUrl);
    addLog('System', 'AWS credentials updated', newConfig);
  };

  const toggleMockMode = (mode) => {
    setIsMockMode(mode);
    localStorage.setItem('api_mode', mode ? 'mock' : 'live');
    addLog('System', `Switched to ${mode ? 'LOCAL MOCK' : 'AWS LIVE'} mode`);
  };

  // --- Cognito Helper for Direct API calls ---
  const callCognito = async (target, payload) => {
    const url = `https://cognito-idp.${awsConfig.region}.amazonaws.com/`;
    const headers = {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`
    };

    addLog('Cognito Request', `HTTP POST to ${url}\nTarget: ${target}`, payload);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      addLog('Cognito Error Response', `Status ${response.status}: ${data.__type || 'UnknownError'}`, data);
      throw new Error(data.message || 'Cognito authentication error');
    }

    addLog('Cognito Success Response', `Status ${response.status}`, data);
    return data;
  };

  // --- Authentication Actions ---
  
  const register = async (email, password) => {
    if (isMockMode) {
      addLog('Mock Cognito', 'Initiating registration mock', { email });
      // Simulate registration
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (mockUsers.some(u => u.email === email)) {
        addLog('Mock Cognito Error', 'User already exists');
        throw new Error('An account with the given email already exists.');
      }
      
      mockUsers.push({ email, password, verified: false });
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      
      addLog('Mock Cognito Success', 'Registration pending verification code code: 123456');
      return { username: email, verified: false };
    } else {
      // Live Cognito signup
      if (!awsConfig.clientId) {
        throw new Error('Cognito Client ID is not configured. Click the settings gear to configure it.');
      }
      
      const payload = {
        ClientId: awsConfig.clientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }]
      };
      
      return await callCognito('SignUp', payload);
    }
  };

  const verifyCode = async (email, code) => {
    if (isMockMode) {
      addLog('Mock Cognito', 'Verifying user registration', { email, code });
      
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const userIndex = mockUsers.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        throw new Error('User not found.');
      }
      
      mockUsers[userIndex].verified = true;
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      
      addLog('Mock Cognito Success', 'Verification complete. User can now sign in.');
      return true;
    } else {
      if (!awsConfig.clientId) {
        throw new Error('Cognito Client ID is not configured.');
      }
      
      const payload = {
        ClientId: awsConfig.clientId,
        Username: email,
        ConfirmationCode: code
      };
      
      await callCognito('ConfirmSignUp', payload);
      return true;
    }
  };

  const resendCode = async (email) => {
    if (isMockMode) {
      addLog('Mock Cognito', 'Resending confirmation code', { email });
      addLog('Mock Cognito Success', 'Code resent: 123456');
      return true;
    } else {
      if (!awsConfig.clientId) {
        throw new Error('Cognito Client ID is not configured.');
      }
      
      const payload = {
        ClientId: awsConfig.clientId,
        Username: email
      };
      
      await callCognito('ResendConfirmationCode', payload);
      return true;
    }
  };

  const login = async (email, password) => {
    if (isMockMode) {
      addLog('Mock Cognito', 'Initiating sign in verification', { email });
      
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const targetUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!targetUser) {
        addLog('Mock Cognito Error', 'Invalid username or password');
        throw new Error('Incorrect username or password.');
      }
      
      if (!targetUser.verified) {
        addLog('Mock Cognito Warning', 'Email not verified yet');
        throw new Error('User is not confirmed.');
      }

      const activeUser = {
        username: email,
        email: email,
        token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 10),
        isAuthenticated: true
      };

      setUser(activeUser);
      localStorage.setItem('current_user', JSON.stringify(activeUser));
      addLog('Mock Cognito Success', 'User signed in successfully', activeUser);
      return activeUser;
    } else {
      if (!awsConfig.clientId) {
        throw new Error('Cognito Client ID is not configured.');
      }

      const payload = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: awsConfig.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      };

      const res = await callCognito('InitiateAuth', payload);
      const token = res.AuthenticationResult.IdToken;

      const activeUser = {
        username: email,
        email: email,
        token,
        isAuthenticated: true
      };

      setUser(activeUser);
      localStorage.setItem('current_user', JSON.stringify(activeUser));
      return activeUser;
    }
  };

  const logout = () => {
    addLog('Cognito', 'Signing out active session', { username: user?.username });
    setUser(null);
    localStorage.removeItem('current_user');
  };

  // --- Ride Request Action ---
  const requestRide = async (latitude, longitude) => {
    if (!user) throw new Error('You must be signed in to request a ride.');

    const pickupLocation = { Latitude: latitude, Longitude: longitude };

    if (isMockMode) {
      addLog('Mock API Gateway', 'POST /ride', { PickupLocation: pickupLocation });
      addLog('Mock Lambda', 'Dispatching unicorn handler started');
      
      // Simulate database write & unicorn selection delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const unicorns = [
        { Name: 'Shadowfax', Color: 'White', Gender: 'Male', Icon: '🦄' },
        { Name: 'Rainbow Dash', Color: 'Blue', Gender: 'Female', Icon: '🦄' },
        { Name: 'Rocinante', Color: 'Grey', Gender: 'Female', Icon: '🦄' },
        { Name: 'Binky', Color: 'Cream', Gender: 'Male', Icon: '🦄' }
      ];
      const selectedUnicorn = unicorns[Math.floor(Math.random() * unicorns.length)];
      const rideId = 'mock-' + Math.random().toString(36).substring(2, 15);

      const rideResponse = {
        RideId: rideId,
        Unicorn: selectedUnicorn,
        Eta: '2 minutes',
        Rider: user.username
      };

      const rideRecord = {
        ...rideResponse,
        PickupLocation: pickupLocation,
        RequestTime: new Date().toISOString()
      };

      addLog('Mock DynamoDB', 'PutItem successful', { TableName: 'Rides', Item: rideRecord });
      addLog('Mock API Gateway Response', 'Status 201 Created', rideResponse);

      // Save to local ride history
      const updatedHistory = [rideRecord, ...rideHistory].slice(0, 10);
      setRideHistory(updatedHistory);
      localStorage.setItem('ride_history', JSON.stringify(updatedHistory));

      return rideRecord;
    } else {
      if (!awsConfig.apiGatewayUrl) {
        throw new Error('API Gateway URL is not configured. Go to Settings in the top-right to set it.');
      }

      addLog('API Gateway Request', `POST ${awsConfig.apiGatewayUrl}`, {
        headers: { Authorization: 'Bearer [CognitoJWTToken]' },
        body: { PickupLocation: pickupLocation }
      });

      const response = await fetch(awsConfig.apiGatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.token
        },
        body: JSON.stringify({ PickupLocation: pickupLocation })
      });

      const data = await response.json();

      if (!response.ok) {
        addLog('API Gateway Error Response', `Status ${response.status}`, data);
        throw new Error(data.Error || data.Message || 'Failed to dispatch unicorn.');
      }

      addLog('API Gateway Success Response', `Status ${response.status}`, data);

      const rideRecord = {
        RideId: data.RideId,
        Unicorn: data.Unicorn,
        Eta: data.Eta,
        Rider: data.Rider,
        PickupLocation: pickupLocation,
        RequestTime: new Date().toISOString()
      };

      const updatedHistory = [rideRecord, ...rideHistory].slice(0, 10);
      setRideHistory(updatedHistory);
      localStorage.setItem('ride_history', JSON.stringify(updatedHistory));

      return rideRecord;
    }
  };

  return (
    <AppContext.Provider
      value={{
        isMockMode,
        awsConfig,
        user,
        rideHistory,
        consoleLogs,
        toggleMockMode,
        updateAwsConfig,
        register,
        verifyCode,
        resendCode,
        login,
        logout,
        requestRide,
        clearLogs,
        addLog
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
