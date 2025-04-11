// lib/auth.js
import { supabase } from "./supabase";  // Supabase'in kurulu olduğu dosya

export const loginWithCredentials = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
};

export const logout = async () => {
  await supabase.auth.signOut();
};
