import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import "./RubricFormModal.css";

const Table = ({ rubricVersion }) => {
  const [rubricDetails, setRubricDetails] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpdatePronunciationModal, setShowUpdatePronunciationModal] = useState(false);
  const [showUpdateGrammarModal, setShowUpdateGrammarModal] = useState(false);
  const [showUpdateFluencyModal, setShowUpdateFluencyModal] = useState(false);
  const [pronunciationFormData, setPronunciationFormData] = useState({
    id: "",
    pronunciation: "",
    descriptor: "",
    rating: "",
  });
  const [grammarFormData, setGrammarFormData] = useState({
    id: "",
    grammar: "",
    descriptor: "",
    rating: "",
  });
  const [fluencyFormData, setFluencyFormData] = useState({
    id: "",
    fluency: "",
    descriptor: "",
    rating: "",
  });

  useEffect(() => {
    const fetchRubricDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://127.0.0.1:8000/api/display-epgf-rubric", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (data.error) {
          setError(data.error);
          return;
        }

        setRubricDetails(data);
      } catch (error) {
        setError("Error fetching rubric details");
        console.error("Error fetching rubric details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRubricDetails();
  }, [rubricVersion]);

useEffect(() => {
  if (rubricDetails) {
    const removeDuplicates = (text) => {
      const words = text?.split(/\s+/) || [];
      const cleanedWords = words.map((word) => word.replace(/[^\w\s.-]/g, "")); // Keep '.' and '-'
      return [...new Set(cleanedWords)].join(" ");
    };

    const formatDescriptor = (descriptor) => {
      if (!descriptor) return "";
      return descriptor.split(".").map((text, index, array) => (
        <span key={index}>
        {text.trim()}
        {index < array.length - 1 && "."} {/* Add the dot back */}
        <br />
        </span>
      ));
    };

    const formattedData = rubricDetails.pronunciations.map((pronunciation, index) => ({
      id: pronunciation.id,
      pronunciation: removeDuplicates(pronunciation.pronunciation || ""),

      // Pronunciation Descriptors
      pronunciationDescriptorRawClean: (pronunciation.descriptor || "").replace(/\s*-\s*/g, " - "), // Ensure "-" is visible
      pronunciationDescriptor: formatDescriptor(pronunciation.descriptor || ""), // Formatted JSX
      pronunciationRating: pronunciation.rating || "",

      // Grammar Descriptors
      grammar: removeDuplicates(rubricDetails.grammars[index]?.grammar || ""),
      grammarDescriptorRawClean: (rubricDetails.grammars[index]?.descriptor || "").replace(/\s*-\s*/g, " - "), // Ensure "-" is visible
      grammarDescriptor: formatDescriptor(rubricDetails.grammars[index]?.descriptor || ""), // Formatted JSX
      grammarRating: rubricDetails.grammars[index]?.rating || "",

      // Fluency Descriptors
      fluency: removeDuplicates(rubricDetails.fluencies[index]?.fluency || ""),
      fluencyDescriptorRawClean: (rubricDetails.fluencies[index]?.descriptor || "").replace(/\s*-\s*/g, " - "), // Ensure "-" is visible
      fluencyDescriptor: formatDescriptor(rubricDetails.fluencies[index]?.descriptor || ""), // Formatted JSX
      fluencyRating: rubricDetails.fluencies[index]?.rating || "",
    }));

    setData(formattedData);
  }
}, [rubricDetails]);


  // Pronunciation
  const handlePronunciationUpdate = (id, category) => {
    const selectedRow = data.find((row) => row.id === id);
    if (selectedRow) {
      setPronunciationFormData({
        id,
        pronunciation: selectedRow.pronunciation,
        descriptor: selectedRow.pronunciationDescriptorRawClean,
        rating: selectedRow.pronunciationRating,
      });

      setShowUpdatePronunciationModal(true);
    }
  };

  const handlePronunciationInputChange = (e) => {
    const { name, value } = e.target;
    setPronunciationFormData((prevData) => ({
      ...prevData,
      [name]: value,  // Updates the corresponding field in state
    }));
  };

  const handlePronunciationFormSubmit = async (e) => {
    e.preventDefault();

    // Send updated data to the backend
    const updatedData = await updatePronunciation(pronunciationFormData.id, pronunciationFormData);

    if (updatedData) {
      // Update local state to reflect changes in the table
      setData((prevData) =>
      prevData.map((row) =>
      row.id === pronunciationFormData.id
      ? { ...row, pronunciation: pronunciationFormData.pronunciation, pronunciationDescriptor: pronunciationFormData.descriptor, pronunciationRating: pronunciationFormData.rating }
      : row
      )
      );
    }

    setShowUpdatePronunciationModal(false);
  };

  const updatePronunciation = async (id, pronunciationData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/pronunciation/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pronunciationData),
      });

      if (!response.ok) {
        throw new Error("Failed to update pronunciation");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating pronunciation:", error);
      return null;
    }
  };

    // Grammar
  const handleGrammarUpdate = (id, category) => {
    const selectedRow = data.find((row) => row.id === id);
    if (selectedRow) {
      setGrammarFormData({
        id,
        grammar: selectedRow.grammar,
        descriptor: selectedRow.grammarDescriptorRawClean,
        rating: selectedRow.grammarRating,
      });

      setShowUpdateGrammarModal(true);
    }
  };

  const handleGrammarInputChange = (e) => {
    const { name, value } = e.target;
    setGrammarFormData((prevData) => ({
      ...prevData,
      [name]: value,  // Updates the corresponding field in state
    }));
  };

  const handleGrammarFormSubmit = async (e) => {
    e.preventDefault();

    const updatedData = await updateGrammar(grammarFormData.id, grammarFormData);

    if (updatedData) {
      // Update local state to reflect changes in the table
      setData((prevData) =>
      prevData.map((row) =>
      row.id === grammarFormData.id
      ? { ...row, grammar: grammarFormData.grammar, grammarDescriptor: grammarFormData.descriptor, grammarRating: grammarFormData.rating }
      : row
      )
      );
    }

    setShowUpdateGrammarModal(false);
  };

  const updateGrammar = async (id, grammarData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/grammar/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(grammarData),
      });

      if (!response.ok) {
        throw new Error("Failed to update grammar");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating grammar:", error);
      return null;
    }
  };


  // Fluency
  const handleFluencyUpdate = (id, category) => {
    const selectedRow = data.find((row) => row.id === id);
    if (selectedRow) {
      setFluencyFormData({
        id,
        fluency: selectedRow.fluency,
        descriptor: selectedRow.fluencyDescriptorRawClean,
        rating: selectedRow.fluencyRating,
      });

      setShowUpdateFluencyModal(true);
    }
  };

  const handleFluencyInputChange = (e) => {
    const { name, value } = e.target;
    setFluencyFormData((prevData) => ({
      ...prevData,
      [name]: value, // Updates the corresponding field in state
    }));
  };

  const handleFluencyFormSubmit = async (e) => {
    e.preventDefault();

    const updatedData = await updateFluency(fluencyFormData.id, fluencyFormData);

    if (updatedData) {
      // Update local state to reflect changes in the table
      setData((prevData) =>
      prevData.map((row) =>
      row.id === fluencyFormData.id
      ? {
        ...row,
        fluency: fluencyFormData.fluency,
        fluencyDescriptor: fluencyFormData.descriptor,
        fluencyRating: fluencyFormData.rating,
      }
      : row
      )
      );
    }

    setShowUpdateFluencyModal(false);
  };

  const updateFluency = async (id, fluencyData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/fluency/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fluencyData),
      });

      if (!response.ok) {
        throw new Error("Failed to update fluency");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating fluency:", error);
      return null;
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: () => <span className="epgf-header">EPGF Rubric</span>,
        id: "epgf_rubric",
        columns: [
          { Header: "Pronunciation", accessor: "pronunciation" },
          { Header: "Pronunciation-Descriptor", accessor: "pronunciationDescriptor" },
          { Header: "Rating", accessor: "pronunciationRating" },
          {
            Header: "Action",
            accessor: "pronunciationUpdate",
            Cell: ({ row }) => (
              <button
              onClick={() => handlePronunciationUpdate(row.original.id, "Pronunciation")}
              className="rubric-update-button"
              >
              Update
              </button>
            ),
          },
          { Header: "Grammar", accessor: "grammar" },
          { Header: "Grammar-Descriptor", accessor: "grammarDescriptor" },
          { Header: "Rating", accessor: "grammarRating" },
          {
            Header: "Action",
            accessor: "grammarUpdate",
            Cell: ({ row }) => (
              <button
              onClick={() => handleGrammarUpdate(row.original.id, "Grammar")}
              className="rubric-update-button"
              >
              Update
              </button>
            ),
          },
          { Header: "Fluency", accessor: "fluency" },
          { Header: "Fluency-Descriptor", accessor: "fluencyDescriptor" },
          { Header: "Rating", accessor: "fluencyRating" },
          {
            Header: "Action",
            accessor: "fluencyUpdate",
            Cell: ({ row }) => (
              <button
              onClick={() => handleFluencyUpdate(row.original.id, "Fluency")}
              className="rubric-update-button"
              >
              Update
              </button>
            ),
          },
        ],
      },
    ],
    [data]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <div className="rubric-table-container">
    <table {...getTableProps()} className="rubric-table">
    <thead>
    {headerGroups.map((headerGroup) => (
      <tr {...headerGroup.getHeaderGroupProps()} className="rubric-header-row">
      {headerGroup.headers.map((column) => (
        <th {...column.getHeaderProps()} className="rubric-header-cell">
        {column.render("Header")}
        </th>
      ))}
      </tr>
    ))}
    </thead>
    <tbody {...getTableBodyProps()}>
    {rows.map((row) => {
      prepareRow(row);
      return (
        <tr {...row.getRowProps()} className="rubric-table-row">
        {row.cells.map((cell) => (
          <td {...cell.getCellProps()} className="rubric-table-cell">
          {cell.render("Cell")}
          </td>
        ))}
        </tr>
      );
    })}
    </tbody>
    </table>

    {showUpdatePronunciationModal && (
      <div className="pronunciation-modal-overlay">
      <h2 className="pronunciation-modal-title">Update Pronunciation</h2>
      <form onSubmit={handlePronunciationFormSubmit}>
      <div>
      <label className="pronunciation-modal-label">Pronunciation:</label>
      <input
      type="text"
      name="pronunciation"
      value={pronunciationFormData.pronunciation}
      onChange={handlePronunciationInputChange}
      className="pronunciation-modal-input"
      />
      </div>
      <div>
      <label className="pronunciation-modal-label">Descriptor:</label>
      <textarea
      name="descriptor"
      value={pronunciationFormData.descriptor}
      onChange={handlePronunciationInputChange}
      className="pronunciation-modal-input"
      rows="4"
      />
      </div>
      <div>
      <label className="pronunciation-modal-label">Rating:</label>
      <input
      type="number"
      name="rating"
      value={pronunciationFormData.rating}
      onChange={handlePronunciationInputChange}
      className="pronunciation-modal-input"
      step="0.2"
      />
      </div>
      <div className="pronunciation-modal-actions">
      <button type="button" onClick={() => setShowUpdatePronunciationModal(false)} className="pronunciation-modal-button pronunciation-cancel-button">
      Cancel
      </button>
      <button type="submit" className="pronunciation-modal-button pronunciation-update-button">
      Update
      </button>
      </div>
      </form>
      </div>
    )}

    {showUpdateGrammarModal && (
      <div className="pronunciation-modal-overlay">
      <h2 className="pronunciation-modal-title">Update Grammar</h2>
      <form onSubmit={handleGrammarFormSubmit}>
      <div>
      <label className="pronunciation-modal-label">Grammar:</label>
      <input
      type="text"
      name="grammar"
      value={grammarFormData.grammar}
      onChange={handleGrammarInputChange}
      className="pronunciation-modal-input"
      />
      </div>
      <div>
      <label className="pronunciation-modal-label">Descriptor:</label>
      <textarea
      name="descriptor"
      value={grammarFormData.descriptor}
      onChange={handleGrammarInputChange}
      className="pronunciation-modal-input"
      rows="4"
      />
      </div>
      <div>
      <label className="pronunciation-modal-label">Rating:</label>
      <input
      type="number"
      name="rating"
      value={grammarFormData.rating}
      onChange={handleGrammarInputChange}
      className="pronunciation-modal-input"
      step="0.2"
      />
      </div>
      <div className="pronunciation-modal-actions">
      <button type="button" onClick={() => setShowUpdateGrammarModal(false)} className="pronunciation-modal-button pronunciation-cancel-button">
      Cancel
      </button>
      <button type="submit" className="pronunciation-modal-button pronunciation-update-button">
      Update
      </button>
      </div>
      </form>
      </div>
    )}

    {showUpdateFluencyModal && (
      <div className="pronunciation-modal-overlay">
      <h2 className="pronunciation-modal-title">Update Fluency</h2>
      <form onSubmit={handleFluencyFormSubmit}>
      <div>
      <label className="pronunciation-modal-label">Fluency:</label>
      <input
      type="text"
      name="fluency"
      value={fluencyFormData.fluency}
      onChange={handleFluencyInputChange}
      className="pronunciation-modal-input"
      />
      </div>
      <div>
      <label className="pronunciation-modal-label">Descriptor:</label>
      <textarea
      name="descriptor"
      value={fluencyFormData.descriptor}
      onChange={handleFluencyInputChange}
      className="pronunciation-modal-input"
      rows="4"
      />
      </div>
      <div>
      <label className="pronunciation-modal-label">Rating:</label>
      <input
      type="number"
      name="rating"
      value={fluencyFormData.rating}
      onChange={handleFluencyInputChange}
      className="pronunciation-modal-input"
      step="0.2"
      />
      </div>
      <div className="pronunciation-modal-actions">
      <button type="button" onClick={() => setShowUpdateFluencyModal(false)} className="pronunciation-modal-button pronunciation-cancel-button">
      Cancel
      </button>
      <button type="submit" className="pronunciation-modal-button pronunciation-update-button">
      Update
      </button>
      </div>
      </form>
      </div>
    )}
    </div>
  );
};

export default Table;
