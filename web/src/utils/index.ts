export const storage = {
  get(key: string) {
    return localStorage.getItem(key);
  },

  set(key: string, value: string) {
    return localStorage.setItem(key, value);
  },

  remove(key: string) {
    return localStorage.removeItem(key);
  },
};
