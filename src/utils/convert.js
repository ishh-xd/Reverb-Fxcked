
module.exports = {
  convertTime: function (duration) {

    let seconds = parseInt((duration / 1000) % 60);
    let minutes = parseInt((duration / (1000 * 60)) % 60);
    let hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (duration >= 86400000) "◉ LIVE";
    if (duration >= 3600000) return hours + ":" + minutes + ":" + seconds;
    if (duration < 3600000) return minutes + ":" + seconds;
  },
  StringToMs: function (string) {
    const seconds = string.match(/(\d+(?:\.\d+)?)\s*(s|seconds?|secs?)/i);
    const minutes = string.match(/(\d+(?:\.\d+)?)\s*(m|minutes?|mins?)/i);
    const hours = string.match(/(\d+(?:\.\d+)?)\s*(h|hours?|hrs?)/i);
    const days = string.match(/(\d+(?:\.\d+)?)\s*(d|days?)/i);
    const weeks = string.match(/(\d+(?:\.\d+)?)\s*(w|weeks?)/i);
    const months = string.match(/(\d+(?:\.\d+)?)\s*(mo|months?)/i);
    const years = string.match(/(\d+(?:\.\d+)?)\s*(y|years?)/i);
    let ms = 0;
    if (seconds) ms += parseFloat(seconds[1]) * 1000;
    if (minutes) ms += parseFloat(minutes[1]) * 60000;
    if (hours) ms += parseFloat(hours[1]) * 3600000;
    if (days) ms += parseFloat(days[1]) * 86400000;
    if (weeks) ms += parseFloat(weeks[1]) * 604800000;
    if (months) ms += parseFloat(months[1]) * 2629800000;
    if (years) ms += parseFloat(years[1]) * 31557600000;
    return ms;
  },

  NumberToBNH: function (num) {
    
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B";
    } else if (num > 999 && num < 1000000) {
      return (num / 1000).toFixed(1) + 'K';
    } else if (num > 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num < 900) {
      return num;
    }
  },
  convertNumber: function (number, decPlaces) {

    decPlaces = Math.pow(10, decPlaces);

    var abbrev = ["K", "M", "B", "T"];

    for (var i = abbrev.length - 1; i >= 0; i--) {

      var size = Math.pow(10, (i + 1) * 3);

      if (size <= number) {

        number = Math.round(number * decPlaces / size) / decPlaces;


        if ((number == 1000) && (i < abbrev.length - 1)) {
          number = 1;
          i++;
        }

        number += abbrev[i];

        break;
      }
    }

    return number;
  },
  chunk: function (arr, size) {
    const temp = [];
    for (let i = 0; i < arr.length; i += size) {
      temp.push(arr.slice(i, i + size));
    }
    return temp;
  },

  shorten: function (text, maxLen = 15) {
    return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
  },

  convertHmsToMs: function (string) {

    let seconds = parseInt((string / 1000) % 60),
      minutes = parseInt((string / (1000 * 60)) % 60),
      hours = parseInt((string / (1000 * 60 * 60)) % 24),
      days = parseInt((string / (1000 * 60 * 60 * 24)) % 7),
      weeks = parseInt((string / (1000 * 60 * 60 * 24 * 7)) % 4),
      months = parseInt((string / (1000 * 60 * 60 * 24 * 7 * 4)) % 12),
      years = parseInt((string / (1000 * 60 * 60 * 24 * 7 * 4 * 12)) % 100);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    days = (days < 10) ? "0" + days : days;
    weeks = (weeks < 10) ? "0" + weeks : weeks;
    months = (months < 10) ? "0" + months : months;
    years = (years < 10) ? "0" + years : years;
    if (string < 60000) {
      return seconds + "s";
    } else if (string < 3600000) {
      return minutes + "m " + seconds + "s";
    }
    else if (string < 86400000) {
      return hours + "h " + minutes + "m " + seconds + "s";
    }
    else if (string < 604800000) {
      return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
    }
    else if (string < 2419200000) {
      return weeks + "w " + days + "d " + hours + "h " + minutes + "m " + seconds + "s";
    }
    else if (string < 29030400000) {
      return months + "mo " + weeks + "w " + days + "d " + hours + "h " + minutes + "m " + seconds + "s";
    }
    else {
      return years + "y " + months + "mo " + weeks + "w " + days + "d " + hours + "h " + minutes + "m " + seconds + "s";
    }
  }
}

