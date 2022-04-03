import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommendations from "./components/Recommendations";
import { useApolloClient, useSubscription } from "@apollo/client";
import { ALL_BOOKS, BOOK_ADDED } from "./queries";
import { Routes, Route, Link } from "react-router-dom";

export const updateCache = (cache, query, addedBook) => {
  const uniqByTitle = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.name;
      return seen.has(k) ? false : seen.add(k);
    });
  };
  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(addedBook)),
    };
  });
};

const App = () => {
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded;
      console.log(addedBook);
      window.alert(`New book ${addedBook.title} was just added`);
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };
  return (
    <div>
      <div>
        <Link to="/authors">
          <button>authors</button>
        </Link>
        <Link to="/books">
          <button>books</button>
        </Link>
        {token ? (
          <>
            <Link to="/create">
              <button>add book</button>
            </Link>
            <Link to="/recommendations">
              <button>recommendations</button>
            </Link>
            <Link to="/">
              <button onClick={logout}>logout</button>
            </Link>
          </>
        ) : (
          <Link to="/login">
            <button>login</button>
          </Link>
        )}
      </div>

      <Routes>
        <Route path="/" element={<Authors />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/books" element={<Books />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/login" element={<LoginForm setToken={setToken} />} />
        <Route path="/create" element={<NewBook />} />
      </Routes>
    </div>
  );
};

export default App;
