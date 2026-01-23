import moment from "moment";

export function formatDate(dateString) {
  return moment(dateString).format("MMM DD, YYYY");
}

export function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export const splitArrayIntoTwo = (array) => {
  const half = Math.ceil(array.length / 2);
  return [array.slice(0, half), array.slice(half)];
};

/**
 * Format a number to a readable string (e.g., 1.2M, 500K, 1.5K)
 * @param {number} num - The number to format
 * @returns {string} - Formatted number string
 */
export function formatNumber(num) {
  if (!num || num === 0) return "0";
  
  const numValue = typeof num === 'string' ? parseInt(num, 10) : num;
  
  if (isNaN(numValue)) return "0";
  
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  return numValue.toLocaleString();
}
