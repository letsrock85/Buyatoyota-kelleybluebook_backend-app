import logger from '../libs/logger';
import { ParseError } from '../libs/errors';

// Pick the shortest items then sort them by alphabet
function smartFilter(arr, key) {
  // Sort by trim length
  let result = arr.sort(function(a, b) {
    return a[key].length - b[key].length;
  });
  // Define max length by picking up the first element
  const shortest = result[0][key].length;
  // Sort by max length
  result = result.filter(function(obj) {
    return obj[key].length <= shortest;
  });
  // Sort alphabetically
  result = result.sort(function(a, b) {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  });
  return result;
}

// Return as lower case and split by "_"
function adaptForChunks(str) {
  return str.toString().toLowerCase().split('_');
}

// Remove dashes from a string
function resetStyle(str) {
  return str.toString().toLowerCase().replace("-", "");
}

// Filter an array list by any value
function filterByAny(arr, value) {
  return arr.filter(function(obj) {
    // Use value parameter to create a regex object
    const re = new RegExp(resetStyle(value), 'i');
    // Test if item contains value at any position
    return re.test(resetStyle(obj.model + obj.style + obj.primarybodystyle));
  });
}

// Filter an array list by manufacturer
function filterByManufacturer(arr, value) {
  return arr.filter(function(obj) {
    // Use value parameter to create a regex object
    const re = new RegExp(resetStyle(value), 'i');
    // Test if item contains value at any position
    return re.test(resetStyle(obj.manufacturer));
  });
}

// Filter an array list by series name
function filterBySeriesName(arr, value) {
  return arr.filter(function(obj) {
    // Use value parameter to create a regex object
    const re = new RegExp(resetStyle(value), 'i');
    // Test if item contains value at any position
    return re.test(resetStyle(obj.model));
  });
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Collect the result
function match(list, table) {
  // Create a copy of the lookup table
  let result = table.slice();

  // Pass the first item in the list as a manufacturer name
  result = filterByManufacturer(result, list[0]);
  if (result.length < 1) throw new ParseError({message: `Manufacturer ${capitalizeFirstLetter(list[0])} not found.`});

  // Pass the second item in the list as a series name
  result = filterBySeriesName(result, list[1]);
  if (result.length < 1) throw new ParseError({message: `Series ${capitalizeFirstLetter(list[1])} not found.`});

  // Remove the first item in the list
  list.shift();

  // Filter while there are elements to match
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (!item) continue;
    var temp = filterByAny(result, item);
    if (temp.length > 0) result = temp;
  }

  return result;
}

// Sort lookup table items by year
function sortByYear(arr) {
  return arr.sort(function(a, b) {
    if (a.year > b.year) return -1;
    if (a.year < b.year) return 1;
    return 0;
  });
}


/* ======= new additional functionality for 1 series determination ======== */
function findProperOne(arr, caryear){
  const results = arr.filter(function (d) {
    return d['year'] >= caryear;
  });
  if(results.length < 1) throw new ParseError({message: `No match has been found for ${caryear}.`});
  return results[0];
}

export default {
  getIDs(buffer, obj1, obj2) {
    return new Promise((resolve, reject) => {
      let table_data = buffer;

      // json or string
      if(typeof(buffer) === "string") {
        try {
          table_data = JSON.parse(buffer);
        } catch (e) {
          logger.log(e.message);
          return reject(e);
        }
      }
      // Prepare proper series string to match
      let toyotaChunks = [];
      let competitorChunks = [];

      // Set first elem as a manufacturer, in this case Toyota
      toyotaChunks.push(obj1.manufacturer.toString().toLowerCase());
      // Concat the rest of vehicle data
      toyotaChunks = toyotaChunks.concat(adaptForChunks(obj1.series.toString().toLowerCase()));

      // Set first elem as a manufacturer
      competitorChunks.push(obj2.manufacturer.toString().toLowerCase());
      // Concat the rest of vehicle data
      competitorChunks = competitorChunks.concat(adaptForChunks(obj2.series));
      // Match the chunks
      let toyotaMatch = match(toyotaChunks, table_data);
      let competitorMatch = match(competitorChunks, table_data);

      // Filter by Style property length and alphabet
      toyotaMatch = smartFilter(toyotaMatch, "style");
      competitorMatch = smartFilter(competitorMatch, "style");

      // Filter by Model property length and alphabet
      toyotaMatch = smartFilter(toyotaMatch, "model");
      competitorMatch = smartFilter(competitorMatch, "model");

      // Sort results by year
      toyotaMatch = sortByYear(toyotaMatch);
      competitorMatch = sortByYear(competitorMatch);

      toyotaMatch = findProperOne(toyotaMatch, 2016);
      competitorMatch = findProperOne(competitorMatch, 2016);

      resolve({
        arr1: toyotaMatch,
        arr2: competitorMatch
      });
    });
  }
}
