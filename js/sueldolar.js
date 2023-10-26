document.addEventListener('DOMContentLoaded', function () {
  // Get a reference to your text input element by its ID.
  const montoInput = document.getElementById('monto');
  const mesSelect = document.getElementById('mes');
  const anioSelect = document.getElementById('anio');
  const indices = ["indec", "blue", "ripte", "icl"]; // List of index names
  const indexDataCache = {}; // Cache for storing fetched JSON data

  updateIndec(parseInt(anioSelect.value), parseInt(mesSelect.value));

  // Add an event listener to the input element to capture input events.
  montoInput.addEventListener('input', function (event) {
    // Get the input value.
    let inputValue = event.target.value;

    // Remove any existing currency symbol, non-digit characters, and commas.
    inputValue = inputValue.replace(/[^\d]/g, '');

    // Limit the input to a maximum value of 99,999,999.
    inputValue = inputValue.slice(0, 8); // Limit to 8 digits (99,999,999)

    // Group digits by 3s using commas as the thousands separator.
    inputValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Update the input value with the formatted currency.
    event.target.value = inputValue;
  });

  // Add event listeners to input and selects
  montoInput.addEventListener('input', calculateAndUpdateIndices);

  mesSelect.addEventListener('change', calculateAndUpdateIndices);
  anioSelect.addEventListener('change', calculateAndUpdateIndices);

  // Function to fetch JSON data for an index
  function fetchIndexData(index) {
    // Construct the file path for the JSON file
    const filePath = `data/${index}.json`;

    // Check if data is already cached
    if (indexDataCache[index]) {
      return Promise.resolve(indexDataCache[index]);
    }

    // Fetch the JSON data for the index
    return fetch(filePath)
    .then(response => response.json())
    .then(data => {
      // Cache the fetched data
      indexDataCache[index] = data;
      return data;
    })
    .catch(error => {
      console.error(`Error loading JSON file ${filePath}: ${error}`);
    });
  }

  function updateBlue(anio, mes, salario) {
    fetchIndexData("blue")
    .then(indexData => {
      let latestYear = 0;
      let latestMonth = 0;

      // Find the last available year and month in the JSON data
      for (const year in indexData) {
        if (indexData.hasOwnProperty(year)) {
          const months = indexData[year];
          const monthKeys = Object.keys(months).map(Number);
          const maxMonth = Math.max(...monthKeys);

          if (parseInt(year) > latestYear || (parseInt(year) === latestYear && maxMonth > latestMonth)) {
            latestYear = parseInt(year);
            latestMonth = maxMonth;
          }
        }
      }

      // Get the index value for the selected month and year
      const indexValue = indexData[anio][mes];
      const latestValue = indexData[latestYear][latestMonth];
      const blueAtDate = salario / indexValue;
      const blueToday = salario / latestValue;

      // Update the corresponding div with the calculated change
      const blueAtDateDiv = document.getElementById("blue-pasado");
      blueAtDateDiv.textContent = blueAtDate > 0 ? `US$ ${Math.floor(blueAtDate).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}.-` : 'US$ 0.-';

      const blueTodayDiv = document.getElementById("blue-hoy");
      blueTodayDiv.textContent = blueToday > 0 ? ` ${Math.floor(blueToday).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}.-` : ' 0';

    })
    .catch(error => {
      console.error(`Error loading JSON file blue: ${error}`);
    });
  }

  function updateIndec(anio, mes) {
    fetchIndexData("indec")
    .then(indexData => {
      let latestYear = 0;
      let latestMonth = 0;

      // Find the last available year and month in the JSON data
      for (const year in indexData) {
        if (indexData.hasOwnProperty(year)) {
          const months = indexData[year];
          const monthKeys = Object.keys(months).map(Number);
          const maxMonth = Math.max(...monthKeys);

          if (parseInt(year) > latestYear || (parseInt(year) === latestYear && maxMonth > latestMonth)) {
            latestYear = parseInt(year);
            latestMonth = maxMonth;
          }
        }
      }

      // Get the index value for the selected month and year
      const indexValue = indexData[anio][mes];
      const latestValue = indexData[latestYear][latestMonth];
      const percentage = 100 - 100 * indexValue / latestValue;

      // Update the corresponding div with the calculated change
      const indexDiv = document.getElementById("porcentaje-monto");
      indexDiv.textContent = percentage > 0 ? `${Math.floor(percentage).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}%` : '0%';
    })
    .catch(error => {
      console.error(`Error loading JSON file indec: ${error}`);
    });
  }

  // Function to calculate and update indices for all indices
  function calculateAndUpdateIndices() {
    // Get the selected salary amount, month, and year
    const salario = parseInt(montoInput.value.replaceAll('.','')) || 0;
    const selectedMes = parseInt(mesSelect.value);
    const selectedAnio = parseInt(anioSelect.value);

    updateBlue(selectedAnio, selectedMes, salario);

    updateIndec(selectedAnio, selectedMes);

  }
});
