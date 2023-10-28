export const convertGoals = (goalString) => {
  var goalMatches = goalString.slice(1, -1).split(', Goal');
  
  var arrayOfObjects = goalMatches.map((item) => {
    // Add 'Goal' back to the start of each string
    var match = ('Goal' + item).match(/Goal\(question='(.+)', visualization='(.+)', rationale='(.+)', index=(\d+)\)/);
    return {
      question: match[1],
      visualization: match[2],
      rationale: match[3],
      index: parseInt(match[4]),
    };
  });
  
  return arrayOfObjects;
};
