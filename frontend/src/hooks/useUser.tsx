import axios from "axios";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [loadingUser, setLoadingUser] = useState(true);
  const [userDetails, setUserDetails] = useState(null);

  async function getDetails() {
    try {
      const res = await axios.get("/user/details", {
        withCredentials: true,
      });
      setUserDetails(res.data);
      setLoadingUser(false); // Move setLoading inside try block to ensure it's always set
    } catch (err) {
      console.log(err);
      setLoadingUser(false); // Set loading to false in case of error
    }
  }

  useEffect(() => {
    getDetails();
  }, []); // Empty dependency array, so it runs only once on component mount

  useEffect(() => {
    if (userDetails) {
      // console.log("User details:", userDetails);
    }
  }, [userDetails]); // Log userDetails whenever it changes

  return { loadingUser, userDetails };
};