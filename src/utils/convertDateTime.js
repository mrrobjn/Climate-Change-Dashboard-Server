export const convertDateTime = (datetime) => {
    let dates = datetime.map((isoDateTime) => {
      let date = new Date(isoDateTime); // Convert to Date object
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based in JavaScript
      let day = String(date.getDate()).padStart(2, "0");
  
      return `${year}-${month}-${day}`; // Return the date string
    });
    return dates;
  };