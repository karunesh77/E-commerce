// axiosInstance.js ko store chahiye, lekin seedha import karne se circular
// import ban jaata hai (store.js -> authSlice -> auth.api -> axiosInstance -> store.js).
// Isliye store khud ko register karta hai, aur axiosInstance lazily access karta hai.
let _store = null;

export const registerStore = (store) => {
  _store = store;
};

export const getStore = () => _store;
