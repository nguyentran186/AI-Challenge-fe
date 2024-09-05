import React, { useState, useEffect } from 'react';
import { Autocomplete, Button, Checkbox, TextField, Container, Card } from "@mui/material";
import ResultItem from "./resultItem";
import top100Films from "./top100Films"; // Assuming this is imported, but not used in the final code

interface Tag {
  label: string;
}

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const N = 100;

function getFirstNElements(arr: string[], n: number = N) {
  return arr.slice(0, n);
}

export default function App() {
  const [form1, setForm1] = React.useState({
    tag_search: false,
    tag_query: '',
    tag_k: "2000",
  });

  const [form2, setForm2] = React.useState({
    prompt_search: false,
    prompt_query: "",
    prompt_k: "200",
    translate: false,
  });

  const [result, setResult] = React.useState<string[]>([
  ]);
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState<string>(''); // To track current input value
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    // Fetch the tag list JSON file
    fetch('/taglist.json')
      .then(response => response.json())
      .then((data: string[]) => {
        // Convert array of strings to array of Tag objects
        const tagsArray = data.map(tag => ({ label: tag }));
        setTags(tagsArray);
      });
  }, []);

  const handleInputChange = (event: React.ChangeEvent<{}>, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleChange = (event: React.ChangeEvent<{}>, newValue: Tag | null) => {
    if (newValue) {
      setSelectedTags(prevTags => [...prevTags, newValue.label]);
      setForm1(prevForm1 => ({
        ...prevForm1,
        tag_query: prevForm1.tag_query ? `${prevForm1.tag_query} ${newValue.label}` : newValue.label
      }));
      setInputValue(''); // Reset the input value
    } else {
      setInputValue('');
    }
  };

  const handleClearSelectedTags = () => {
    setSelectedTags([]); // Clear the all selected tags list
    setForm1(prevForm1 => ({ ...prevForm1, tag_query: '' })); // Clear tag_query in form1
  };

  const [selectResult, setSelectResult] = React.useState<string[]>([]);
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});

  const onChangeForm1 = (key: string, value: any) => {
    setForm1(prev => ({ ...prev, [key]: value }));
  };

  const onChangeForm2 = (key: string, value: any) => {
    setForm2(prev => ({ ...prev, [key]: value }));
  };

  const handleClick = async () => {
    const bodySend = {
      ...form1,
      ...form2,
    };
    console.log(bodySend);

    try {
      const response = await fetch("http://localhost:8080/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodySend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRemove = () => {
    setResult(prev => prev.filter(item => !selectResult.includes(item)));
  };

  const handleMoveTop = () => {
    setResult(prev => [...selectResult, ...prev.filter(item => !selectResult.includes(item))]);
    setSelectResult([]);
    setCheckedItems({});
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 2, display: "flex", gap: 9 }}>
      <div
        style={{
          width: 300,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 1,
            gap: 1.5,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <p
              style={{
                margin: 0,
              }}
            >
              Search tags
            </p>
            <Checkbox
              {...label}
              style={{
                padding: 0,
                borderRadius: 6,
              }}
              checked={form1.tag_search}
              onChange={() => onChangeForm1("tag_search", !form1.tag_search)}
            />
          </div>

          <Autocomplete
            disablePortal
            options={tags.filter(tag => tag.label.toLowerCase().includes(inputValue.toLowerCase()))} // Filter options based on current input
            renderInput={(params) => <TextField {...params} label="Tag" variant="outlined" size="small" />}
            size="small"
            inputValue={inputValue} // Use inputValue state
            onInputChange={handleInputChange} // Update inputValue on change
            onChange={handleChange} // Update tempTags and selectedTags on change
            value={null} // Ensures input is cleared after selection
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <TextField
              label="Tag filter number"
              variant="outlined"
              size="small"
              sx={{ maxWidth: "180px" }}
              value={form1.tag_k}
              onChange={(e) => onChangeForm1("tag_k", e.target.value)}
            />
          </div>

          <div>
            <h4>All Selected Tags:</h4>
            <ul>
              {selectedTags.map((tag, index) => (
                <li key={index}>{tag}</li>
              ))}
            </ul>
            <Button onClick={handleClearSelectedTags} variant="contained">Clear All Selected Tags</Button>
          </div>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 1,
            gap: 1.5,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <p style={{ margin: 0 }}>Search text</p>
            <Checkbox
              {...label}
              style={{ padding: 0, borderRadius: 6 }}
              checked={form2.prompt_search}
              onChange={() => onChangeForm2("prompt_search", !form2.prompt_search)}
            />
          </div>

          <TextField
            label="Text"
            variant="outlined"
            size="small"
            value={form2.prompt_query}
            onChange={(e) => onChangeForm2("prompt_query", e.target.value)}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <TextField
              label="Text filter number"
              variant="outlined"
              size="small"
              sx={{ maxWidth: "180px" }}
              value={form2.prompt_k}
              onChange={(e) => onChangeForm2("prompt_k", e.target.value)}
            />

            <p style={{ margin: 0, marginLeft: 10 }}>Translate</p>
            <Checkbox
              {...label}
              style={{ padding: 0, borderRadius: 6 }}
              checked={form2.translate}
              onChange={() => onChangeForm2("translate", !form2.translate)}
            />
          </div>
        </Card>

        <Button
          variant="contained"
          sx={{ height: 40, width: "100%" }}
          onClick={handleClick}
        >
          Search
        </Button>
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Button
            color="error"
            variant="contained"
            sx={{ height: 40 }}
            onClick={handleRemove}
          >
            Remove
          </Button>
          <Button
            variant="contained"
            sx={{ height: 40 }}
            onClick={handleMoveTop}
          >
            Move to top
          </Button>
        </div>
        <Card
          variant="outlined"
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            padding: 1,
            gap: 2.5,
            flexWrap: "wrap",
            overflow: "auto",
            maxHeight: "75vh",
          }}
        >
          {getFirstNElements(result).map((name) => (
            <ResultItem
              name={name}
              key={name}
              checked={!!checkedItems[name]}
              setRemoveResult={setSelectResult}
              setCheckedItems={setCheckedItems}
            />
          ))}
        </Card>
      </div>
    </Container>
  );
}
