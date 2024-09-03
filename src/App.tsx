import { Autocomplete, Button, Checkbox, TextField } from "@mui/material";
import Container from "@mui/material/Container";
import ResultItem from "./resultItem";
import Card from "@mui/material/Card";
import top100Films from "./top100Films";
import React from "react";
const label = { inputProps: { "aria-label": "Checkbox demo" } };

const N = 3;

function getFirstNElements(arr: string[], n: number = N) {
  return arr.slice(0, n);
}

export default function App() {
  const [form1, setForm1] = React.useState({
    tag_search: false,
    tag_query: {
      label: "123",
      year: 2000,
    },
    tag_k: "2000",
  });

  const [form2, setForm2] = React.useState({
    prompt_search: false,
    prompt_query: "",
    prompt_k: "200",
    translate: false,
  });

  const [result, setResult] = React.useState<string[]>([
    "Laa_Vbbb_cc1",
    "Laa_Vbbb_cc2",
    "Laa_Vbbb_cc3",
    "Laa_Vbbb_cc4",
    "Laa_Vbbb_cc5",
    "Laa_Vbbb_cc6",
  ]);

  const [selectResult, setSelectResult] = React.useState<string[]>([]);
  const [checkedItems, setCheckedItems] = React.useState<
    Record<string, boolean>
  >({});

  const onChangeForm1 = (key: string, value: any) => {
    setForm1((prev) => {
      const cpy = { ...prev };
      // @ts-ignore
      cpy[key] = value;
      return cpy;
    });
  };

  const onChangeForm2 = (key: string, value: any) => {
    setForm2((prev) => {
      const cpy = { ...prev };
      // @ts-ignore
      cpy[key] = value;
      return cpy;
    });
  };

  const handleClick = async () => {
    const bodySend = {
      ...form1,
      ...form2,
    };
    console.log(bodySend);

    //   try {
    //     const response = await fetch("https://api.example.com/data", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(bodySend),
    //     });

    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }

    //     const data = await response.json();

    //     // <-- thêm setResult dưới comment này -->

    //   } catch (error) {
    //     console.error("Error:", error);
    // }

    setResult(["123", "12345678"]);
  };

  const handleRemove = () => {
    setResult((prev) => {
      const cpy = [...prev];
      return cpy.filter((item) => !selectResult.includes(item));
    });
  };

  const handleMoveTop = () => {
    setResult((prev) => {
      const cpy = [...prev];
      const cleanCpy = cpy.filter((item) => !selectResult.includes(item));
      return [...selectResult, ...cleanCpy];
    });
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
              value={form1.tag_search}
              onClick={() => {
                onChangeForm1("tag_search", !form1.tag_search);
              }}
            />
          </div>

          <Autocomplete
            disablePortal
            options={top100Films}
            renderInput={(params) => <TextField {...params} label="Tag" />}
            size="small"
            value={form1.tag_query}
            onChange={(event, newValue) => {
              onChangeForm1("tag_query", newValue);
            }}
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
              sx={{
                maxWidth: "180px",
              }}
              value={form1.tag_k}
              onChange={(e) => {
                onChangeForm1("tag_k", e.target.value);
              }}
            />
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
            <p
              style={{
                margin: 0,
              }}
            >
              Search text
            </p>
            <Checkbox
              {...label}
              style={{
                padding: 0,
                borderRadius: 6,
              }}
              value={form2.prompt_search}
              onClick={() => {
                onChangeForm2("prompt_search", !form2.prompt_search);
              }}
            />
          </div>

          <TextField
            label="Text"
            variant="outlined"
            size="small"
            value={form2.prompt_query}
            onChange={(e) => {
              onChangeForm2("prompt_query", e.target.value);
            }}
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
              sx={{
                maxWidth: "180px",
              }}
              value={form2.prompt_k}
              onChange={(e) => {
                onChangeForm2("prompt_k", e.target.value);
              }}
            />

            <p
              style={{
                margin: 0,
                marginLeft: 10,
              }}
            >
              Translate
            </p>
            <Checkbox
              {...label}
              style={{
                padding: 0,
                borderRadius: 6,
              }}
              value={form2.translate}
              onClick={() => {
                onChangeForm2("translate", !form2.translate);
              }}
            />
          </div>
        </Card>

        <Button
          variant="contained"
          sx={{
            height: 40,
            width: "100%",
          }}
          onClick={() => {
            handleClick();
          }}
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
            sx={{
              height: 40,
            }}
            onClick={() => handleRemove()}
          >
            Remove
          </Button>
          <Button
            variant="contained"
            sx={{
              height: 40,
            }}
            onClick={() => handleMoveTop()}
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
