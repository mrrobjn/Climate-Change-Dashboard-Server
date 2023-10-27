export const convertGoalToArr = (str) => {
  str = str.replace("Goal(", "").slice(0, -1);

  let arr = str.split(", ");

  let obj = {};

  arr.forEach((item) => {
    // Split each item into key and value using '=' as separator
  let parts = item.split('=');
  
  // Check if parts array has two elements
  if (parts.length === 2) {
    let [key, value] = parts;
    
    // Remove the single quotes from the value
    value = value.replace(/'/g, "");
    
    // Add the key-value pair to the object
    obj[key] = value;
  }
  });

  // Convert the object to an array of objects
  let result = [obj];

  return result;
};
