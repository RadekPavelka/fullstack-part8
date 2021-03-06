import { ME, ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client";

const Recommendations = () => {
  const books = useQuery(ALL_BOOKS);
  const result = useQuery(ME);

  if (result.error || books.error) {
    return <div>Error...</div>;
  }

  if (result.loading || books.loading) {
    return <div>Loading...</div>;
  }

  const favoriteGenre = result.data.me.favoriteGenre;
  const filteredBooks = books.data.allBooks.filter((b) =>
    b.genres.includes(favoriteGenre)
  );

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <b>{favoriteGenre}</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
