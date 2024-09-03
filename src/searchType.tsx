import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

export default function BasicSelect() {
  const [age, setAge] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  return (
    <Box sx={{ minWidth: 140 }}>
      <FormControl fullWidth>
        <InputLabel
          id="demo-simple-select-label"
          size="small"
          sx={{ backgroundColor: "white", paddingRight: 1 }}
        >
          Search type
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={age}
          label="Age"
          onChange={handleChange}
          size="small"
        >
          <MenuItem value={"filter_only"}>Filter Only</MenuItem>
          <MenuItem value={"query_only"}>Query Only</MenuItem>
          <MenuItem value={"both"}>Both</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
