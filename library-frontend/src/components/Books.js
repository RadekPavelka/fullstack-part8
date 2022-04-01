import { useLazyQuery, useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { useEffect, useState } from "react";

const Books = (props) => {
  const [getBooksByGenre, { loading, data }] = useLazyQuery(ALL_BOOKS);
  const [genre, setGenre] = useState(null);

  useEffect(() => {
    getBooksByGenre();
  }, [getBooksByGenre]);

  if (!props.show) {
    return null;
  }

  if (loading) {
    return <div>loading...</div>;
  }

  const books = data.allBooks;

  // uses reduce to get all genres and converts it to Set to remove duplicates
  const allGenres = Array.from(
    new Set(
      books.reduce(
        (previousValue, currentValue) => [
          ...previousValue,
          ...currentValue.genres,
        ],
        []
      )
    )
  );

  const handleGenreChange = (genre) => {
    if (!genre) {
      setGenre(null);
      getBooksByGenre();
    }
    setGenre(genre);
    getBooksByGenre({ variables: { genre: genre } });
  };

  console.log("allGenres", allGenres);

  return (
    <div>
      <h2>books</h2>
      {genre && (
        <p>
          in genre <strong>{genre}</strong>
        </p>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data?.allBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {allGenres.map((genre) => (
          <button key={genre} onClick={(e) => handleGenreChange(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={(e) => handleGenreChange()}>all genres</button>
      </div>
    </div>
  );
};

export default Books;
