import axios from '../components/axiosConfig';

const dogBreeds = [];

// Funkcja do pobierania danych o psach z API
async function fetchDogs() {
  try {
    const { data: dogs } = await axios.get('/dogs'); // Pobieranie danych Axiosem

    console.log('Fetched dogs:', dogs); // Logowanie pobranych danych

    // Przekształcenie danych do odpowiedniego formatu
    dogs.forEach(dog => {
      const mappedDog = {
        id: dog.dog_id,  // Zmieniamy dog_id na id
        name: dog.race,  // Zmieniamy race na name
        imageUrl: `/photos/${dog.race}.jpg` || 'default-image.jpg',  // Domyślny obrazek, jeśli brak
        description: dog.description,  // Opis
        category: dog.category || 'Unknown',  // Domyślna wartość
        size: dog.size || 'Unknown',  // Domyślna wartość
        traits: dog.traits ? dog.traits.split(',') : [],  // Przekształcamy cechy na tablicę
        activity: dog.activity || 'Unknown',  // Domyślna wartość dla aktywności
        age: dog.age || 'Unknown',  // Domyślna wartość dla wieku
        cost_range: dog.cost_range || 'Unknown'  // Domyślna wartość dla kosztu
      };

      dogBreeds.push(mappedDog);  // Dodajemy przekształcone dane do tablicy dogBreeds
    });
  } catch (error) {
    console.error('Axios fetch error:', error);
  }
}

// Wywołanie funkcji do pobrania danych
fetchDogs();

// Eksportowanie tablicy dogBreeds
export default dogBreeds;
