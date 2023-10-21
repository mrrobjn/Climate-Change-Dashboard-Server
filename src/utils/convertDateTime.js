import moment from "moment-timezone";


export const convertToLocalTime = (datetimeArray) => {
  return datetimeArray.map(datetime => {
    let localTime = moment.utc(datetime).local().format('MM-DD-YYYY HH:mm');
    return localTime;
  });
};

