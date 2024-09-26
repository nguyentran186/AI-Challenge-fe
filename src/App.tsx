import React, { useState, useEffect } from 'react';
import { Autocomplete, Button, Checkbox, TextField, Container, Card, Box } from "@mui/material";
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
    prompt_k: "100",
    translate: false,
  });

  const [form3, setForm3] = React.useState({
    ocr_search: false,
    ocr_query: "",
    ocr_k: "100", // Or any default value
  });

  const [result, setResult] = React.useState<string[]>([
  ]);
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState<string>(''); // To track current input value
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [textData, setTextData] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>(''); //
  const [questionData, setQuestionData] = useState<string>(''); //

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

  const onChangeForm3 = (key: string, value: any) => {
    setForm3(prev => ({ ...prev, [key]: value }));
  };

  const handleClick = async () => {
    const bodySend = {
      ...form1,
      ...form2,
      ...form3,
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

  const handleSetTop = () => {
    if (replaceText) {
      const frameParts = replaceText.split('_'); // Split the frame into parts: [L01, V001, 003]
      const baseFrame = parseInt(frameParts[2], 10); // Extract the frame number (e.g., 003 as 3)
  
      // Create two previous and two next frames
      const newFrames = [
        replaceText, // Original frame at position 0
        `${frameParts[0]}_${frameParts[1]}_${String(baseFrame - 2).padStart(3, '0')}`,
        `${frameParts[0]}_${frameParts[1]}_${String(baseFrame - 1).padStart(3, '0')}`,
        `${frameParts[0]}_${frameParts[1]}_${String(baseFrame + 1).padStart(3, '0')}`,
        `${frameParts[0]}_${frameParts[1]}_${String(baseFrame + 2).padStart(3, '0')}`,
      ];
  
      // Update the result by replacing the first 5 elements and then appending the rest of prev
      setResult(prev => [...newFrames, ...prev.slice(5)]);
  
      setReplaceText(''); // Clear the input field
    }
  };
  

  const handleMoveTop = () => {
    setResult(prev => [...selectResult, ...prev.filter(item => !selectResult.includes(item))]);
    setSelectResult([]);
    setCheckedItems({});
  };

  const handleExport = async () => {
    const exportData = {
      images: getFirstNElements(result), // List of images
      textData, // Text input data from the export box
      questionData,
    };

    try {
      const response = await fetch("http://localhost:8080/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Export successful:", data);

    } catch (error) {
      console.error("Error:", error);
    }
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
{/* 
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
            <p style={{ margin: 0 }}>Search OCR</p>
            <Checkbox
              {...label}
              style={{ padding: 0, borderRadius: 6 }}
              checked={form3.ocr_search}
              onChange={() => onChangeForm3("ocr_search", !form3.ocr_search)}
            />
          </div>

          <TextField
            label="OCR Text"
            variant="outlined"
            size="small"
            value={form3.ocr_query}
            onChange={(e) => onChangeForm3("ocr_query", e.target.value)}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <TextField
              label="OCR filter number"
              variant="outlined"
              size="small"
              sx={{ maxWidth: "180px" }}
              value={form3.ocr_k}
              onChange={(e) => onChangeForm3("ocr_k", e.target.value)}
            />
          </div>
        </Card> */}


        <Button
          variant="contained"
          sx={{ height: 40, width: "100%" }}
          onClick={handleClick}
        >
          Search
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Q&A Answer"
          variant="outlined"
          size="small"
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
          sx={{ flex: 8 }}
        />
        <TextField
          label="No"
          variant="outlined"
          size="small"
          value={questionData}
          onChange={(e) => setQuestionData(e.target.value)}
          sx={{ flex: 2 }}
        />
        </Box>

        <Button
          variant="contained"
          color="secondary"
          sx={{ height: 40, width: "100%" }}
          onClick={handleExport}
        >
          Export
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
          <div style={{ display: "flex", gap: 10 }}>
            <TextField
              label="Frame name"
              variant="outlined"
              size="small"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)} // Handle text input
            />
            <Button variant="contained" onClick={handleSetTop}>
              Set Top
            </Button>
          </div>

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
