
import dayjs from 'dayjs';
import Cookies from 'js-cookie';

const getAllCookies = () => Cookies.get();

const setLocalStorage = (
  key: string,
  value: any,
  expire_unix_time?: number,
) => {
  const data = {
    value,
    expire_unix_time,
  };

  const options = expire_unix_time
    ? { expires: new Date(expire_unix_time * 1000) }
    : {};

  Cookies.set(key, JSON.stringify(data), options);
};

const getLocalStorage = (key: string) => {
  const data = Cookies.get(key);

  if (!data) return null;

  try {
    const parsedData = JSON.parse(data);

    if (
      parsedData.expire_unix_time &&
      parsedData.expire_unix_time <= dayjs().unix()
    ) {
      Cookies.remove(key);
      return null;
    }

    return parsedData.value ?? null;
  } catch (error) {
    Cookies.remove(key);
    return null;
  }
};



const clearLocalStorage = (key: string) => {
  Cookies.remove(key);
};

const clearAllLocalStorage = () => {
  Object.keys(Cookies.get()).forEach((key) => {
    Cookies.remove(key);
  });
};

const getUnixTime = (
  value: number,
  unit: dayjs.ManipulateType,
) => {
    
  return dayjs().add(value, unit).unix();
};

export {
  clearAllLocalStorage,
  clearLocalStorage,
  getAllCookies,
  getLocalStorage,
  getUnixTime,
  setLocalStorage,
};
