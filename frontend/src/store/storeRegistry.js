// axiosInstance.js ko store chahiye (token read karne, dispatch karne ke liye),
// lekin agar wo seedha "store.js" import kare toh circular import ban jaata hai
// (store.js -> authSlice -> auth.api -> axiosInstance -> store.js).
//
// Isliye store khud ko yahan "register" karta hai apna banne ke baad,
// aur axiosInstance isse lazily (function call ke andar) access karta hai.
let _store = null;

export const registerStore = (store) => {
  _store = store;
};

export const getStore = () => _store;
