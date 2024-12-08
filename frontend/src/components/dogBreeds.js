const dogBreeds = [];

// Funkcja do pobierania danych o psach z API
async function fetchDogs() {
  try {
    const response = await fetch('http://localhost:5000/dogs');
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const dogs = await response.json();
    console.log('Fetched dogs:', dogs);  // Logowanie pobranych danych
    
    // Przekształcenie danych do odpowiedniego formatu
    dogs.forEach(dog => {
      const mappedDog = {
        id: dog.dog_id,  // Zmieniamy dog_id na id
        name: dog.race,  // Zmieniamy race na name
        imageUrl: dog.image || 'default-image.jpg',  // Dodajemy domyślny obrazek, jeśli brak
        description: dog.description,  // Opis
        category: dog.category || 'Unknown',  // Ustawiamy "Unknown", jeśli brak kategorii
        size: dog.size || 'Unknown',  // Ustawiamy "Unknown", jeśli brak rozmiaru
        traits: dog.traits ? dog.traits.split(',') : [],  // Jeśli traits istnieją, przekształcamy je w tablicę
        activity: dog.activity || 'Unknown',  // Dodajemy domyślną wartość dla activity
        age: dog.age || 'Unknown',  // Dodajemy domyślną wartość dla wieku
        cost_range: dog.cost_range || 'Unknown'  // Dodajemy domyślną wartość dla cost_range
      };

      dogBreeds.push(mappedDog);  // Dodajemy przekształcone dane do tablicy dogBreeds
    });
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Wywołanie funkcji do pobrania danych
fetchDogs();

// Eksportowanie tablicy dogBreeds
export default dogBreeds;
