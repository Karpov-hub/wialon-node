const removeTimezoneOffset = function(date) {
    return new Date(new Date(date).getTime() + new Date(date).getTimezoneOffset()*60000);
  }

export default {
    removeTimezoneOffset
};