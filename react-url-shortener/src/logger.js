const useLogger = () => {
  const log = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[LOG] [${timestamp}]: ${message}`);
  };
  return log;
};

export default useLogger;
