import { useState } from 'react';

import axios from 'axios';

export function useSignOut() {
  const [isLoading, setIsLoading] = useState(false);


  const signOut = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/user/signout', {}, {
        withCredentials: true, // Include credentials if you're using sessions
      });

      if (response.status === 200) {
        // Redirect to login page or home page after successful sign out
      } else {
        throw new Error('Failed to sign out');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Handle error (e.g., show a notification to the user)
    } finally {
      setIsLoading(false);
    }
  };

  return { signOut, isLoading };
}

