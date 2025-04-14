import { useEffect, useState } from "react";
import axios from "axios";

function SearchPage() {
  const [dogs, setDogs] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBreeds();
  }, []);

  useEffect(() => {
    fetchDogs();
  }, [selectedBreed, sortOrder, page]);

  const fetchBreeds = async () => {
    const res = await axios.get(
      "https://frontend-take-home-service.fetch.com/dogs/breeds",
      { withCredentials: true }
    );
    setBreeds(res.data);
  };

  const fetchDogs = async () => {
    const searchResponse = await axios.post(
      "https://frontend-take-home-service.fetch.com/dogs/search",
      {
        breeds: selectedBreed ? [selectedBreed] : [],
        sort: `breed:${sortOrder}`,
        size: 12,
        from: (page - 1) * 12,
      },
      { withCredentials: true }
    );

    if (searchResponse.data.resultIds.length > 0) {
      const detailsRes = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs",
        searchResponse.data.resultIds,
        { withCredentials: true }
      );
      setDogs(detailsRes.data);
    } else {
      setDogs([]);
    }
  };

  const handleMatch = async () => {
    try {
      const matchRes = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs/match",
        { dogIds: favorites },
        { withCredentials: true }
      );

      const matchId = matchRes.data.match;
      const matchDetails = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs",
        [matchId],
        { withCredentials: true }
      );

      const match = matchDetails.data[0];
      alert(`🎉 Your match is ${match.name}, a ${match.breed}!`);
    } catch (err) {
      alert("Match failed.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 10 }}>
        <select onChange={(e) => setSelectedBreed(e.target.value)}>
          <option value="">All Breeds</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          Sort: {sortOrder}
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {dogs.map((dog) => (
          <div
            key={dog.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              width: 250,
              borderRadius: 5,
            }}
          >
            <img
              src={dog.img}
              alt={dog.name}
              style={{ width: "100%", height: 150, objectFit: "cover" }}
            />
            <h3>{dog.name}</h3>
            <p>Breed: {dog.breed}</p>
            <p>Age: {dog.age}</p>
            <p>Zip: {dog.zip_code}</p>
            <button
              onClick={() =>
                setFavorites((prev) =>
                  prev.includes(dog.id)
                    ? prev.filter((id) => id !== dog.id)
                    : [...prev, dog.id]
                )
              }
            >
              {favorites.includes(dog.id) ? "♥ Favorited" : "♡ Favorite"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>Prev</button>
        <span style={{ margin: "0 10px" }}>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      {favorites.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={handleMatch}>Find My Match</button>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
