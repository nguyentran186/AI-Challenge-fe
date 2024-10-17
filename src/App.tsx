import React, { useState, useRef, useEffect } from 'react';
import { Autocomplete, Button, Checkbox, TextField, Container, Card, Box} from "@mui/material";
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
  const [token, setToken] = useState<string | null>(null);
  const [id, setID] = useState<string | null>(null);
  const [idqa, setIDQA] = useState<string | null>(null);
  const [msData, setMsData] = useState(null);
  const [milliseconds, setMilliseconds] = useState(null); // State to hold the ms value

  useEffect(() => {
    const fetchToken = async () => {
      const formData = {
        username: "team20",
        password: "WRyLDJ2wZG"
      };

      try {
        const response = await fetch('https://eventretrieval.one/api/v2/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',  // Make sure the server knows you're sending JSON
          },
          body: JSON.stringify(formData), // Convert the formData object to a JSON string
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setToken(data.sessionId); // Assuming the token is returned in the 'sessionId' field
        console.log('Token fetched:', data.sessionId);

        // Call fetchID only after the token is successfully fetched
        fetchID(data.sessionId); 

      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    const fetchID = async (sessionId: string) => {
      try {
        const response = await fetch(`https://eventretrieval.one/api/v2/client/evaluation/list?session=${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setID(data[0].id); // Assuming the 'id' field is returned
        setIDQA(data[0].id); // Assuming the 'id' field is returned
        console.log('Data fetched:', data);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchToken(); // Trigger fetching token and fetching ID after token is available
  }, []); // The empty array ensures the effect runs only once

  useEffect(() => {
    // Load ms.json from the public folder
    const loadMsData = async () => {
      try {
        const response = await fetch('/ms.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setMsData(data);
      } catch (error) {
        console.error('Error loading ms.json:', error);
      }
    };
    loadMsData();
  }, []);

  const [form1, setForm1] = React.useState({
    tag_search: false,
    tag_query: '',
    tag_k: "2000",
  });

  const [form2, setForm2] = React.useState({
    prompt_search: true,
    prompt_query: "",
    prompt_k: "100",
    translate: false,
  });

  const [form3, setForm3] = React.useState({
    ocr_search: false,
    ocr_query: "",
    ocr_k: "100", // Or any default value
  });

  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const smallCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const largeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number, y: number } | null>(null); // Store the last known position
  const [sketchTASK, setSketchTASK] = useState<string | null>(null);
  const [textTASK, setTextTASK] = useState<string>("");
  
  const [result, setResult] = React.useState<string[]>([
  ]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState<string>(''); // To track current input value
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [textData, setTextData] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>(''); //
  const [questionData, setQuestionData] = useState<string>(''); //
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textQueries, setTextQueries] = useState<string[]>([""]);

  const setCanvasBackground = (canvas: HTMLCanvasElement, color: string) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const smallCanvas = smallCanvasRef.current;
    if (smallCanvas) {
      setCanvasBackground(smallCanvas, 'white'); // Set white background for small canvas
    }
  }, []);

  const openCanvas = () => {
    setIsCanvasOpen(true);
    const largeCanvas = largeCanvasRef.current;
    if (largeCanvas) {
      setCanvasBackground(largeCanvas, 'white'); // Set white background for large canvas
    }
  };

  const closeCanvas = () => {
    setIsCanvasOpen(false);
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPos(null); // Reset the last position when done drawing
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = largeCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setIsDrawing(true);
      setLastPos({ x, y });
    }
  };
  const getBase64StringFromDataURL = (dataURL: string): string =>
    dataURL.replace('data:', '').replace(/^.+,/, '');

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPos(null); // Reset the last position when done drawing

    // Capture the sketch and display it in the small canvas
    const largeCanvas = largeCanvasRef.current;
    const smallCanvas = smallCanvasRef.current;
    if (largeCanvas && smallCanvas) {
      const largeCtx = largeCanvas.getContext('2d');
      const smallCtx = smallCanvas.getContext('2d');

      if (largeCtx && smallCtx) {
        // Get the image data from the large canvas
        const imageData = largeCanvas.toDataURL();

        // Store the sketch in sketchTASK
        setSketchTASK(getBase64StringFromDataURL(imageData));

        // Draw it on the small canvas (resized)
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
          smallCtx.clearRect(0, 0, smallCanvas.width, smallCanvas.height); // Clear before drawing
          smallCtx.drawImage(img, 0, 0, smallCanvas.width, smallCanvas.height); // Resize the image
        };
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = largeCanvasRef.current;
    if (canvas && lastPos) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Draw a line from the last known position to the current position
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Update the last known position
        setLastPos({ x, y });
      }
    }
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };
  
  const updateSmallCanvas = () => {
    const largeCanvas = largeCanvasRef.current;
    const smallCanvas = smallCanvasRef.current;

    if (largeCanvas && smallCanvas) {
      const smallCtx = smallCanvas.getContext('2d');
      if (smallCtx) {
        smallCtx.clearRect(0, 0, smallCanvas.width, smallCanvas.height); // Clear the small canvas
        smallCtx.drawImage(largeCanvas, 0, 0, smallCanvas.width, smallCanvas.height); // Draw the resized sketch
        const sketchData = smallCanvas.toDataURL(); // Get base64 of the sketch
        setSketchTASK(sketchData); // Store the sketch data
      }
    }
  };

  const handleTextTASK = (value: string) => {
    setTextTASK(value);
  }

  const handleSearchBySketchandText = async () => {
    if (!sketchTASK || !textTASK) {
      alert('Please provide both a sketch and text.');
      return;
    }

    const searchData = {
      sketch: sketchTASK,
      text: textTASK,
    };

    try {
      const response = await fetch("http://localhost:8080/search_by_sketch_text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const handleAddQuery = () => {
    setTextQueries(prevQueries => [...prevQueries, ""]); // Add a new empty query
  };
  const handleQueryChange = (index: number, value: string) => {
    const updatedQueries = [...textQueries];
    updatedQueries[index] = value; // Update the specific query
    setTextQueries(updatedQueries);
  };
  const handleRemoveQuery = (index: number) => {
    const updatedQueries = textQueries.filter((_, i) => i !== index); // Remove the query at the specified index
    setTextQueries(updatedQueries);
  };

  const handleSearchBySequence = async () => {
    try {
      const response = await fetch("http://localhost:8080/search_by_sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ queries: textQueries }), // Send only the final query
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data); // Assuming `setResult` updates the state to display images

    } catch (error) {
      console.error("Error during search by sequence:", error);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        setSelectedFile(event.target.files[0]);
    }
    };

  const handleSearchByImage = async () => {
    if (!selectedFile) {
        alert("Please select an image first!");
        return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
        const response = await fetch('http://localhost:8080/search_by_image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        setResult(data);

    } catch (error) {
        console.error("Error uploading image:", error);
    }
  };

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

    // Split the first image name
    var split = exportData.images[0].split("_");
    const batch = split[0]; // e.g., 'L01'
    const video = split[1]; // e.g., 'V001'
    const frame = split[2]; // e.g., '0'

    // Check if msData is not null or undefined
    if (!msData) {
      console.error("msData is null or undefined.");
      return; // Exit the function early
    }

    try {
      // Check if the constructed key exists in msData
      const ms = msData[`${batch}_${video}`][`${frame}`];
      if (ms !== undefined) {
        setMilliseconds(ms); // Assuming you want to store it in state
        
        // Prepare formData based on submission type
        let formData;
        const submissionURL = textData === "" 
          ? `https://eventretrieval.one/api/v2/submit/${id}?session=${token}`
          : `https://eventretrieval.one/api/v2/submit/${idqa}?session=${token}`;

        if (textData === "") {
          console.log("KIS submission");
          formData = {
            "answerSets": [
              {
                "answers": [
                  {
                    "mediaItemName": `${batch}_${video}`,
                    "start": ms,
                    "end": ms,
                  }
                ]
              }
            ]
          };
        } else {
          console.log("QA submission");
          formData = {
            "answerSets": [
              {
                "answers": [
                  {
                    "text": `${textData}-${batch}_${video}-${ms}`
                  }
                ]
              }
            ]
          };
        }

        console.log('Submitting formData:', JSON.stringify(formData, null, 2)); // Print formData

        try {
          const response = await fetch(submissionURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            const errorResponse = await response.json(); // Try to get error details from the server
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorResponse)}`);
          }

          const data = await response.json();
          console.log('Data fetched:', data);

        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.error('Milliseconds data not found for the specified keys.');
        setMilliseconds(null); // Reset to null if not found
      }
    } catch (error) {
      console.error("Error:", error);
    }
};

  return (
    <>
    <Container maxWidth="lg" sx={{ paddingTop: 2, display: "flex", gap: 9 , margin: 0}}>
      {/* Flex container for Search by Sequence on the left and others */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", padding: 0, margin: 0 }}>
        
        {/* Search by Sequence on the left-most */}
        <Box sx={{ width: "250px", flexGrow: 0, flexShrink: 0 }}>
          <Card
            variant="outlined"
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: 1,
              gap: 1.5,
            }}
          >
            <h4>Search by Sequence</h4>
            {textQueries.map((query, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label={`Query ${index + 1}`}
                  variant="outlined"
                  size="small"
                  value={query}
                  onChange={(e) => handleQueryChange(index, e.target.value)}
                  fullWidth
                />
                <Button variant="outlined" color="error" onClick={() => handleRemoveQuery(index)}>Remove</Button>
              </Box>
            ))}
            <Button variant="contained" onClick={handleAddQuery}>+</Button>
            <Button variant="contained" onClick={handleSearchBySequence} sx={{ marginTop: 2 }}>
              Search
            </Button>
          </Card>
          <Card sx={{ marginTop: 2, padding: 2, cursor: "pointer", display: "flex", flexDirection: "column",}}>
            <h4>Search by Sketch and Text</h4>
            <canvas ref={smallCanvasRef} width={200} height={150} style={{ border: '1px solid black' }} onClick={openCanvas}/>
            <TextField
              label="Text"
              variant="outlined"
              size="small"
              onChange={(e) => handleTextTASK(e.target.value)}
              value={textTASK}
              sx={{ marginTop: 2 }}
            />
            <Button variant="contained" onClick={handleSearchBySketchandText} sx={{ marginTop: 2 }}>
              Search
            </Button>
          </Card>
          {/* Small Canvas below Search by Sequence */}

        </Box>

        {/* Middle section with Search Text and Search by Image stacked vertically */}
        <Box sx={{  width: "250px", flexGrow: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          
          {/* Search by Text at the top */}
          <Card
            variant="outlined"
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: 1,
              gap: 1.5,
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <p style={{ margin: 0 }}>Search text</p>
            </div>

            <TextField
              label="Text"
              variant="outlined"
              size="small"
              value={form2.prompt_query}
              onChange={(e) => onChangeForm2("prompt_query", e.target.value)}
            />

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
            <Button
              variant="contained"
              sx={{ height: 40, width: "100%" }}
              onClick={handleClick}
            >
              Search
            </Button>
          </Card>

          {/* Search by Image below Search Text */}
          <Card
            variant="outlined"
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: 1,
              gap: 1.5,
            }}
          >
            <h4>Search by Image</h4>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <Button onClick={handleSearchByImage} variant="contained">Search by Image</Button>
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
              sx={{ height: 40, width: "100%", marginTop: 3 }}
              onClick={handleExport}
            >
              Export
            </Button>
          </Card>
        </Box>
      </Box>
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
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
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
    {isCanvasOpen && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '2000px',
          height: '1000px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={closeCanvas}
      >
        <div
          style={{
            position: 'relative',
            width: '1500',
            height: '1000px',
            backgroundColor: '#fff',
            padding: '10px 100px 10px',
            borderRadius: 8,
            boxShadow: '0px 4px 15px rgba(0,0,0,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => e.stopPropagation()} 
        >
          <h3>Canvas View</h3>
          <canvas
            ref={largeCanvasRef}
            width={1280}
            height={720}
            style={{ border: '2px solid black' }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      </div>
    )}
    </>
  );
  // Function to get handle optional list of text query

}
