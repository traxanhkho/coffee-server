const bucket = require("../firebase/admin");
const { default: axios } = require("axios");
const getFileDownloadUrl = require("./getFileDownloadUrl");

async function getAddressFromVnLocation(cityId, districtId, wardId) {
  function getLocation(locationData, locationId) {
    return locationData.find((location) => location.Id === locationId);
  }

  try {
    const jsonFile = bucket.file("vn-location.json");

    const downloadURL = await getFileDownloadUrl(jsonFile);
    // Fetch the JSON data using Axios
    const { data } = await axios.get(downloadURL);

    let city = getLocation(data, cityId);
    let district = getLocation(city.Districts, districtId);
    let ward = getLocation(district.Wards, wardId);

    return {
      city: {
        id: city.Id,
        name: city.Name,
      },
      district: {
        id: district.Id,
        name: district.Name,
      },
      ward: {
        id: ward.Id,
        name: ward.Name,
      },
    };
  } catch (error) {
    console.error(error);
  }
}

module.exports = getAddressFromVnLocation;
