import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import Select from "react-select";

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  const [authorName, setAuthorName] = useState(null);
  const [authorBirthyear, setAuthorBirthyear] = useState("");

  const [changeBirthyear] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const authors = result.data.allAuthors;

  const submit = (event) => {
    event.preventDefault();
    changeBirthyear({
      variables: {
        name: authorName.value,
        setBornTo: parseInt(authorBirthyear),
      },
    });

    setAuthorName(null);
    setAuthorBirthyear("");
  };

  const selectOptions = () => {
    const authorNames = authors.map((a) => a.name);
    let optionsArr = [];
    for (let i = 0; i < authorNames.length; i++) {
      optionsArr.push({ value: authorNames[i], label: authorNames[i] });
    }
    return optionsArr;
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <Select
            defaultValue={authorName}
            value={authorName}
            onChange={setAuthorName}
            options={selectOptions()}
          />
        </div>
        <div>
          born
          <input
            value={authorBirthyear}
            onChange={({ target }) => setAuthorBirthyear(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
