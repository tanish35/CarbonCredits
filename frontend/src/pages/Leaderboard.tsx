import { Wallet } from '@/components/dashboard/Wallet';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins } from 'lucide-react';
import axios from 'axios';

type LeaderboardItem = {
  walletAddress: string;
  tokensRetired: number;
  quantity: number;
  rank?: number;
};

const rankColors = [
  'bg-yellow-400',
  'bg-gray-300',
  'bg-amber-600',
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
];

export default function Leaderboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [userRank, setUserRank] = useState<number | null | undefined>(null);
  const [userWallet, setUserWallet] = useState<string | null | undefined>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await axios.get('/nft/retiredNFTs', { withCredentials: true });
        let leaderboardData = response.data as LeaderboardItem[];
        leaderboardData = leaderboardData.filter(item => item.quantity > 0 || item.tokensRetired > 0);

        // Sort the data by quantity (desc) and tokensRetired (desc)
        leaderboardData = leaderboardData.sort((a, b) => {
          if (b.quantity === a.quantity) {
            return b.tokensRetired - a.tokensRetired;
          }
          return b.quantity - a.quantity;
        });

        // Assign ranks based on the sorted order
        leaderboardData = leaderboardData.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));

        setData(leaderboardData);

        // Update user rank if wallet address is available
        if (userWallet) {
          const user = leaderboardData.find(item => item.walletAddress === userWallet);
          setUserRank(user ? user.rank : null);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, [userWallet]); // Re-fetch data whenever the user's wallet changes

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);

    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen ${!isDarkMode ? 'dark' : ''}`}>
      <div className="container mx-auto p-6 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Token Retirement Leaderboard</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white transition-colors duration-300"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {/* Dark Mode Toggle */}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg mb-6 text-center"
        >
          {userRank ? (
            <p className="text-2xl font-bold">Your rank is #{userRank} in the top of the leaderboard</p>
          ) : (
            <p className="text-2xl font-bold">You're not ranked yet. Keep participating!</p>
          )}
        </motion.div>
          <div hidden>
            <Wallet onWalletChange={setUserWallet} />
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {data.map((item, index) => (
            <motion.div
              key={item.walletAddress}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transition-colors duration-300"
            >
              <div className={`${rankColors[index % rankColors.length]} p-2 text-center`}>
                <span className="text-3xl font-bold text-white">{item.rank}</span>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {`${item.walletAddress.slice(0, 7)}...${item.walletAddress.slice(-4)}`}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Tokens Retired:</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">{item.tokensRetired}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Quantity:</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">{item.quantity}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(item.tokensRetired / 1000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
