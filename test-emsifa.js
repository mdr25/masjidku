import axios from 'axios';

axios.get("https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json")
  .then(res => console.log("Is Array?", Array.isArray(res.data), "Length:", res.data.length, "First:", res.data[0]))
  .catch(console.error);
