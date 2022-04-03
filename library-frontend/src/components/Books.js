import { useLazyQuery, useQuery } from "@apollo/client";
import { ALL_BOOKS, BOOKS_BY_GENRE } from "../queries";
import { useState } from "react";

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const [getBooksByGenre, { data }] = useLazyQuery(BOOKS_BY_GENRE);
  const [genre, setGenre] = useState(null);

  if (result.loading) {
    return <div>loading...</div>;
  }

  let books = result.data.allBooks;
  let booksToDisplay = data ? data.allBooks : books;

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

  return (
    <div>
      <h2>books</h2>
      {genre && (
        <p>
          in genre <b>{genre}</b>
        </p>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToDisplay.map((b) => (
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
