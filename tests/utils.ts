/**
 * 等待 ms 毫秒
 * @param {number} ms  毫秒
 */
export const sleep = async (ms: number) => {
  return await new Promise((resolve) => setTimeout(resolve, ms));
};
